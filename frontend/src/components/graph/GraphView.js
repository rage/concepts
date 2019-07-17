import React, { useEffect } from 'react'
import { withStyles } from '@material-ui/core'
import {
  WORKSPACE_COURSES_AND_CONCEPTS
} from '../../graphql/Query'
import client from '../../apollo/apolloClient'

import vis from 'vis'

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
          centralGravity: 0.6,
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

  useEffect(() => {
    // Prepare data for loader
    const fillData = async () => {
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

      for (const course of courses) {
        for (const concept of course.concepts) {
          nodes.push({
            id: concept.id,
            label: concept.name,
            group: course.id
          })

          for (const conceptLink of concept.linksToConcept) {
            links.push({
              from: conceptLink.from.id,
              to: concept.id,
              arrows: {
                to: { enabled: true, scaleFactor: 0.4, type: 'arrow' }
              },
              shadow: {
                enabled: false
              },
              smooth: {
                enabled: true,
                type: 'cubicBezier',
                roundness: 0.4
              },
              physics: conceptLink.from.courses[0].id === course.id
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
          group: course.id,
          shape: 'ellipse',
          mass: 1,
          hidden: true
        })
      }
      init(nodes, links)
    }
    // Fill data and initialize the graph
    fillData()
  }, [])

  return <div className={classes.graph} id='graph' />
}


export default withStyles(styles)(GraphView)
