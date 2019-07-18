import React, { useEffect } from 'react'
import { withStyles } from '@material-ui/core'
import {
  WORKSPACE_COURSES_AND_CONCEPTS
} from '../../graphql/Query'
import client from '../../apollo/apolloClient'

import vis from 'vis'
import randomColor from 'randomcolor'

const styles = () => ({
  graph: {
    gridArea: 'content',
    overflow: 'hidden'
  }
})

const GraphView = ({ classes, workspaceId }) => {

  /**
     * Initialize graph view for vis.js
     */
  const init = (nodes, edges) => {
    // create a network
    var container = document.getElementById('graph')
    var options = {
      layout: {
        randomSeed: 1,
        improvedLayout: true
        // hierarchical: {
        //   enabled: true,
        //   levelSeparation: 150,
        //   nodeSpacing: 100,
        //   treeSpacing: 200,
        //   blockShifting: true,
        //   edgeMinimization: true,
        //   parentCentralization: false,
        //   direction: 'LR',        // UD, DU, LR, RL
        //   sortMethod: 'directed'   // hubsize, directed
        // }
      },
      nodes: {
        shape: 'box',
        shadow: true
      },
      edges: {
        width: 2,
        shadow: true
      },
      physics: {
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.5,
          springLength: 95,
          springConstant: 0.02,
          damping: 0.4,
          avoidOverlap: 0.015
        },
        repulsion: {
          centralGravity: 0.1,
          springLength: 200,
          springConstant: 0.05,
          nodeDistance: 200,
          damping: 0.09
        },
        solver: 'barnesHut'
      }
    }
    new vis.Network(container, {
      nodes,
      edges
    }, options)
  }

  useEffect(() => {(async () => {
    // Prepare data for loader
    const response = await client.query({
      query: WORKSPACE_COURSES_AND_CONCEPTS,
      variables: {
        id: workspaceId
      }
    })
    const courses = response.data.workspaceById.courses

    // Initialize data for states
    const nodes = []
    const links = []

    const colors = {}

    const colorToString = ([r, g, b], a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`

    for (const course of courses) {
      colors[course.id] = randomColor({
        luminosity: 'light',
        format: 'rgbArray',
        seed: course.id
      })
      for (const concept of course.concepts) {
        nodes.push({
          id: concept.id,
          label: concept.name,
          color: colorToString(colors[course.id], 1)
        })

        for (const conceptLink of concept.linksToConcept) {
          links.push({
            from: conceptLink.from.id,
            to: concept.id,
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
            smooth: {
              enabled: true,
              type: 'straightCross',
              roundness: 0.4
            },
            physics: false
          })
        }
        links.push({
          from: course.id,
          to: concept.id,
          dashes: true,
          shadow: {
            enabled: false
          }
        })
      }
      nodes.push({
        id: course.id,
        label: course.name,
        color: {
          background: colorToString(colors[course.id], 0.25),
          border: colorToString(colors[course.id], 0.25),
          highlight: colorToString(colors[course.id], 0.5)
        },
        font: {
          color: 'rgba(52, 52, 52, 0.5)'
        },
        shape: 'ellipse',
        mass: 1
      })
    }
    init(nodes, links)
  })()}, [])

  return <div className={classes.graph} id='graph' />
}


export default withStyles(styles)(GraphView)
