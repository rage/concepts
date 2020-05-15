import React, { useRef, useEffect } from 'react'
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


const GraphContainer = ({ workspace, courseId }) => {
    const { graphWrapper } = useStyles()
    const graphRef = useRef(null)

    const state = useRef({
        network: null,
        nodes: null,
        edges: null
    })

    const initGraph = () => {
        const cur = state.current
        const course = workspace.courses.find(course => course.id == courseId)
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
              }
            ]
        })
    }

    useEffect(() => initGraph(), [])

    return (
        <div className={graphWrapper} ref={graphRef}/>
    )
}

const GraphSplitter = () => <div style={{borderLeft: '1px solid black'}} />

const ComparisonView = ({ urlPrefix, workspaceId, compWorkspaceId }) => {

    const { wrapper, containerWrapper, compPercentageWrapper } = useStyles()
    
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

    const distance  = compareCourses(workspace.courses[0], compWorkspace.courses[0])

    return (
        <div className={wrapper}>
            <div className={compPercentageWrapper}>
                <h1> Total distance: { distance.toFixed(2) } </h1>  
            </div>
            <div className={containerWrapper}>
                <GraphContainer workspace={workspace} courseId={workspace.courses[0].id}/>
                <GraphSplitter/>
                <GraphContainer workspace={compWorkspace} courseId={compWorkspace.courses[0].id}/>
            </div>
        </div>
    )
}

export default ComparisonView