import React, { useRef, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core'
import { useQuery } from '@apollo/react-hooks'
import { WORKSPACE_COMPARISON } from '../../graphql/Query'

import LoadingBar from '../../components/LoadingBar'
import { compareConcepts } from './conceptMapComparison'

import cytoscape from 'cytoscape'
import klay from 'cytoscape-klay'

cytoscape.use(klay)

const useStyles = makeStyles(theme => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        padding: '4px'
    },
    containerWrapper: {
        display: 'flex',
        flexDirection: 'row',
        height: '90%'
    },
    compPercentageWrapper: {
        display: 'flex',
        justifyContent: 'center'
    },
    graphWrapper: {
        display: 'flex',
        width: '50%',
        height: '100%'
    }
}))


const GraphContainer = ({ course, setSelectedConceptIdx, selectedConceptIdx, matches, compared }) => {
    const { graphWrapper } = useStyles()
    const graphRef = useRef(null)
    const networkRef = useRef(null)

    const options = {
        name: 'klay',
        fit: true,
        padding: 100,
        klay: {
            nodePlacement: 'BRANDES_KOEPF',
            nodeLayering: 'NETWORK_SIMPLEX',
            spacing: 20,
            inLayerSpacingFactor: 2.5,
            layoutHierarchy: true,
            edgeSpacingFactor: 1.5,
            direction: 'DOWN'
        }
    }

    const state = useRef({
        network: null,
        nodes: null,
        edges: null,
        layout: null
    })

    const initGraph = () => {
        const cur = state.current
        if (course == null) return (<div> Course not found </div>)

        cur.nodes = []
        cur.edges = []

        for (const concept of course.concepts) {
            cur.nodes.push({
                group: 'nodes',
                data: {
                    id: concept.id,
                    shape: 'rectangle',
                    label: concept.name,
                    display: 'element',
                    type:'concept'
                }
            })
            for (const conceptLink of concept.linksToConcept) {
                cur.edges.push({
                    group: 'edges',
                    data: {
                        id: conceptLink.from.id + concept.id,
                        source: conceptLink.from.id,
                        type: 'edge',
                        display: 'element',
                        target: concept.id
                    }
                })
            }
        }

        cur.network = cytoscape({
            container: graphRef.current,
            elements: [].concat(cur.nodes, cur.edges),
            style: [
                {
                    selector: 'node[type = "concept"]',
                    style: {
                        label: 'data(label)',
                        shape: 'round-rectangle',
                        width: 'label',
                        height: 'label',
                        'text-wrap': 'wrap',
                        'text-max-width': '200px',
                        'text-valign': 'center',
                        padding: '10px',
                        display: 'data(display)'
                    }
              },
              {
                selector: 'edge',
                style: {
                  width: 5,
                  'line-color': '#ccc',
                  'target-arrow-color': '#ccc',
                  'mid-target-arrow-shape': 'triangle'
                }
              }
            ]
        })

        cur.network.nodes().forEach(node => {
            var pair = null

            if (compared) {
                pair = matches.find(pair => pair.closestPair.name == node.data().label)
            } else {
                pair = matches.find(pair => pair.concept.name == node.data().label)
            }

            if (!pair) {
                node.style('background-color', 'red')
            }
        })

        cur.network.nodes().on('select', evt => {
            const name = evt.target.data().label
            if (compared) {
                setSelectedConceptIdx(matches.findIndex(item => item.closestPair.name == name))
            } else {
                setSelectedConceptIdx(matches.findIndex(item => item.concept.name == name))
            }
        })

        cur.layout = cur.network.layout(options)
        cur.layout.run()
        networkRef.current = cur
    }

    useEffect(() => initGraph(), [])

    if (selectedConceptIdx >= 0) {
        const label = compared ? matches[selectedConceptIdx].closestPair.name : matches[selectedConceptIdx].concept.name
        networkRef.current.network.nodes().forEach(node => {
            if (node.data().label == label) {
                node.select()
            } else {
                node.deselect()
            }
        })
    }

    return (
        <div className={graphWrapper} ref={graphRef}/>
    )
}

const GraphSplitter = () => <div style={{borderLeft: '1px solid black'}} />

const ComparisonView = ({ urlPrefix, workspaceId, compWorkspaceId }) => {
    const { wrapper, containerWrapper, compPercentageWrapper } = useStyles()
    const [courseIndex, setCourseIndex] = useState(0)
    const [selectedConceptIdx, setSelectedConceptIdx] = useState(-1)

    const workspaceQuery = useQuery(WORKSPACE_COMPARISON, { 
        variables: { workspaceId, compWorkspaceId }
    })

    if (!workspaceQuery.data) {
        return <LoadingBar id='comparison-view' />
    }

    const { workspace, compWorkspace } = workspaceQuery.data

    const compareCourses = (course, compCourse) => {
        return compareConcepts(course.concepts, compCourse.concepts) 
    }

    let compCourseList = new Set(compWorkspace.courses.map(course => course.name))
    let courseList = workspace.courses.filter(course => compCourseList.has(course.name))
                                       .map(course => ({
                                           name: course.name,
                                           course: course,
                                           compCourse: compWorkspace.courses.find(compCourse => compCourse.name === course.name)
                                       }))
    
    if (courseList.length === 0) {
        return (
            <div>
                <center>
                    <h1> No similar courses to compare </h1>
                </center>
            </div>
        )
    }

    const {
        matches, 
        percentage,
        avgDistance 
    }  = compareCourses(courseList[courseIndex].course, courseList[courseIndex].compCourse)


    return (
        <div className={wrapper}>
            <div className={compPercentageWrapper}>
                <h1> Similarity of <i>{ courseList[courseIndex].name }</i>: { percentage }% </h1>
            </div>
            <div className={containerWrapper}>
                <GraphContainer 
                    course={courseList[courseIndex].course}
                    setSelectedConceptIdx={setSelectedConceptIdx}
                    selectedConceptIdx={selectedConceptIdx}
                    matches={matches}
                />
                <GraphSplitter/>
                <GraphContainer 
                    course={courseList[courseIndex].compCourse}
                    setSelectedConceptIdx={setSelectedConceptIdx}
                    selectedConceptIdx={selectedConceptIdx}
                    matches={matches}
                    compared
                />
            </div>
        </div>
    )
}

export default ComparisonView