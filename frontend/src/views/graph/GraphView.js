import React, { useEffect, useState, useRef } from 'react'
import { withStyles, Button } from '@material-ui/core'
import vis from 'vis'

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
    top: '60px',
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
  const [mode, redraw] = useState('concepts')
  const state = useRef({
    network: null,
    nodes: null,
    edges: null,
    conceptEdges: null,
    courseEdges: null,
    conceptNodes: null,
    courseNodes: null,
    mode: 'concepts'
  })

  const toggleMode = () => {
    const cur = state.current
    if (!cur.network) {
      alert('Network is not defined.')
      return
    }
    cur.edges.getDataSet().clear()
    cur.nodes.getDataSet().clear()
    if (cur.mode === 'concepts') {
      cur.mode = 'courses'
      cur.nodes.getDataSet().add(cur.courseNodes)
      cur.edges.getDataSet().add(cur.courseEdges)
    } else {
      cur.mode = 'concepts'
      cur.nodes.getDataSet().add(cur.conceptNodes)
      cur.edges.getDataSet().add(cur.conceptEdges)
    }
    redraw(cur.mode)
  }

  const drawConceptGraph = data => {
    const cur = state.current
    cur.conceptNodes = []
    cur.conceptEdges = []
    cur.courseNodes = []
    cur.courseEdges = []

    let colorIndex = 0
    for (const course of data.workspaceById.courses) {
      course.color = colors[colorIndex++]
      for (const concept of course.concepts) {
        cur.conceptNodes.push({
          ...conceptNodeStyle(course.color),
          id: concept.id,
          label: concept.name,
          title: !concept.description ? 'No description available'
            : concept.description.replace('\n', '</br>')
        })

        for (const conceptLink of concept.linksToConcept) {
          cur.conceptEdges.push({
            ...conceptEdgeStyle,
            from: conceptLink.from.id,
            to: concept.id
          })
        }
      }

      cur.courseNodes.push({
        ...courseNodeStyle(course.color),
        shape: 'dot',
        id: course.id,
        label: course.name
      })

      // Get course nodes
      for (const courseLink of course.linksToCourse) {
        if (courseLink.from.id === course.id) {
          continue
        }
        cur.courseEdges.push({
          ...courseEdgeStyle,
          from: courseLink.from.id,
          to: course.id
        })
      }
    }

    cur.nodes = new vis.DataView(new vis.DataSet(cur.conceptNodes), {
      filter: node => (cur.mode === 'concepts' ? cur.conceptEdges : cur.courseEdges)
        .find(edge => edge.from === node.id || edge.to === node.id)
    })
    cur.edges = new vis.DataSet(cur.conceptEdges)

    cur.network = new vis.Network(document.getElementById('graph'), {
      nodes: cur.nodes,
      edges: cur.edges
    }, visOptions)
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

  return <>
    <div className={classes.graph} id='graph' />
    <Button className={classes.navigationButton}
      variant='contained'
      color='secondary'
      onClick={toggleMode}
    >
      Switch to {mode}
    </Button>
  </>
}

export default withStyles(styles)(GraphView)
