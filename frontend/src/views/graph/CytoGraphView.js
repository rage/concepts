import React, { useEffect, useState, useRef } from 'react'
import { makeStyles, Button, CircularProgress } from '@material-ui/core'
import cytoscape from 'cytoscape'
import klay from 'cytoscape-klay'

import {
  WORKSPACE_DATA_FOR_GRAPH
} from '../../graphql/Query'
import client from '../../apollo/apolloClient'
import colors from './colors'
cytoscape.use(klay)

const useStyles = makeStyles({
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
    background: colorToString(color.bg, 0.8),
    border: colorToString(color.bg, 0.5),
    foreground: colorToString(color.fg, 1),
    highlight: colorToString(color.bg, 1)
  },
  shape: 'ellipse',
  mass: 2
})

const GraphView = ({ workspaceId }) => {
  const classes = useStyles()
  const [nextMode, redraw] = useState('concepts')
  const state = useRef({
    network: null,
    nodes: null,
    edges: null,
    conceptEdges: null,
    courseEdges: null,
    conceptNodes: null,
    courseNodes: null,
    mode: 'courses'
  })

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
          group: 'nodes',
          data: {
            id: concept.id,
            label: concept.name,
            title: !concept.description ? 'No description available'
              : concept.description.replace('\n', '</br>')
          }
        })

        for (const conceptLink of concept.linksToConcept) {
          cur.conceptEdges.push({
            group: 'edges',
            data: {
              id: conceptLink.from.id + concept.id,
              source: conceptLink.from.id,
              target: concept.id
            }
          })
        }
      }
    }

    const cy = cytoscape({
      container: document.getElementById('graph'),
      elements: cur.conceptNodes.concat(cur.conceptEdges),
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(label)'
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      layout: {
        name: 'klay'
      }
    })
  }

  useEffect(() => {
    (async () => {
      const response = await client.query({
        query: WORKSPACE_DATA_FOR_GRAPH,
        variables: {
          id: workspaceId
        }
      })
      drawConceptGraph(response.data)
    })()
  }, [])

  return <>
    <div className={classes.graph} id='graph'>
      {/* <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div> */}
    </div>
    <Button className={classes.navigationButton}
      variant='contained'
      color='secondary'
    // onClick={toggleMode}
    >
      Switch to {nextMode}
    </Button>
  </>
}

export default GraphView
