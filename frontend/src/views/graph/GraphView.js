import React, { useEffect, useState } from 'react'
import vis from 'vis'
import { withStyles, Button } from '@material-ui/core'

import {
  WORKSPACE_DATA_FOR_GRAPH
} from '../../graphql/Query'
import client from '../../apollo/apolloClient'
import colors from './colors'

const styles = () => ({
  graph: {
    gridArea: 'content',
    overflow: 'hidden'
  },
  navigationButton: {
    top: '70px',
    left: '10px',
    zIndex: '10',
    position: 'absolute'
  }
})

// Function to converting rgbArray into CSS rgba() color
const colorToString = ([r, g, b], a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`

// Style for edges between concepts (concept links)
const conceptEdgeStyle = {
  arrows: {
    to: {
      enabled: true,
      scaleFactor: 0.4,
      type: 'arrow'
    }
  },
  color: {
    inherit: 'both'
  },
  shadow: {
    enabled: false
  },
  physics: false
}

// Style for edges between courses (course links)
const courseEdgeStyle = {
  ...conceptEdgeStyle
}

// Style for edges linking concepts to their courses
const conceptToCourseEdgeStyle = {
  dashes: true,
  shadow: {
    enabled: false
  }
}

const commonNodeStyle = {
  widthConstraint: {
    maximum: 175
  }
}

// Style for concept nodes
const conceptNodeStyle = (color) => ({
  ...commonNodeStyle,
  color: colorToString(color.bg, 1)
})

// Style for course nodes
const courseNodeStyle = (color) => ({
  ...commonNodeStyle,
  font: {
    color: 'rgba(52, 52, 52, 0.5)'
  },
  color: {
    background: colorToString(color.bg, 1),
    border: colorToString(color.bg, 0.5),
    foreground: colorToString(color.fg, 1),
    highlight: colorToString(color.bg, 0.5)
  },
  shape: 'ellipse',
  mass: 2
})

// Global vis.js options
const visOptions = {
  layout: {
    hierarchical: {
      sortMethod: 'directed',
      direction: 'UD',
      levelSeparation: 100
    }
  },
  nodes: {
    shape: 'box',
    shadow: true
  },
  edges: {
    shadow: true
  },
  physics: {
    hierarchicalRepulsion: {
      centralGravity: 1,
      springConstant: 0.1,
      nodeDistance: 140,
      damping: 1.2
    },
    solver: 'hierarchicalRepulsion'
  },
  interaction: {
    tooltipDelay: 100
  }
}

const GraphView = ({ classes, workspaceId }) => {

  // Network data
  const [network, setNetwork] = useState(null)

  // Global data
  const [nodes, setNodes] = useState(null)
  const [edges, setEdges] = useState(null)

  // State
  const [state, setState] = useState('concepts')

  // Concept data
  const [conceptNodes, setConceptNodes] = useState([])
  const [conceptEdges, setConceptEdges] = useState([])

  // Course data
  const [courseNodes, setCourseNodes] = useState([])
  const [courseEdges, setCourseEdges] = useState([])

  const changeGraph = () => {
    if (!network) {
      alert('Network is not defined.')
      return
    }
    nodes.clear()
    edges.clear()
    if (state == 'concepts') {
      for (const courseNode of courseNodes) {
        nodes.add(courseNode)
      }
      for (const courseEdge of courseEdges) {
        edges.add(courseEdge)
      }
      setState('courses')
    } else {
      for (const conceptNode of conceptNodes) {
        nodes.add(conceptNode)
      }
      for (const conceptEdge of conceptEdges) {
        edges.add(conceptEdge)
      }
      setState('concepts')
    }
  }

  const drawConceptGraph = (data) => {
    let nodes = []
    const edges = []

    const courseNodes = []
    const courseEdges = []

    let colorIndex = 0
    for (const course of data.workspaceById.courses) {
      course.color = colors[colorIndex++]
      for (const concept of course.concepts) {
        nodes.push({
          ...conceptNodeStyle(course.color),
          id: concept.id,
          label: concept.name,
          title: !concept.description ? 'No description available' : concept.description.replace('\n', '</br>')
        })

        for (const conceptLink of concept.linksToConcept) {
          edges.push({
            ...conceptEdgeStyle,
            from: conceptLink.from.id,
            to: concept.id
          })
        }
      }

      // Get course nodes
      for (const courseLink of course.linksToCourse) {
        if (courseLink.from.id === course.id) {
          continue
        }
        courseEdges.push({
          ...courseEdgeStyle,
          from: courseLink.from.id,
          to: course.id
        })
      }
      courseNodes.push({
        ...courseNodeStyle(course.color),
        shape: 'dot',
        id: course.id,
        label: course.name
      })
    }

    // Remove all nodes that don't have links
    nodes = nodes.filter(node => edges.find(edge => edge.from === node.id || edge.to === node.id))

    // Create edges and nodes
    const nodeData = new vis.DataSet(nodes)
    const edgeData = new vis.DataSet(edges)

    const network = new vis.Network(document.getElementById('graph'), {
      nodes: nodeData,
      edges: edgeData
    }, visOptions)

    // Set network
    setNetwork(network)

    // Global
    setNodes(nodeData)
    setEdges(edgeData)

    // Concepts
    setConceptNodes(nodes)
    setConceptEdges(edges)

    // Courses
    setCourseNodes(courseNodes)
    setCourseEdges(courseEdges)

  }

  useEffect(() => {(async () => {
    const response = await client.query({
      query: WORKSPACE_DATA_FOR_GRAPH,
      variables: {
        id: workspaceId
      }
    })
    drawConceptGraph(response.data)
  })()}, [])

  return (
    <>
    <div className={classes.graph} id='graph' />
      <Button className={classes.navigationButton}
        variant='contained'
        color='secondary'
        onClick={changeGraph}
      >
        {`Switch to ${state === 'concepts' ? 'courses' : 'concepts'}`}
      </Button>
    </>
  )
}

export default withStyles(styles)(GraphView)
