import React, { useEffect } from 'react'
import Container from '@material-ui/core/Container'
import { withStyles } from '@material-ui/core'
import {
  WORKSPACE_COURSES_AND_CONCEPTS
} from '../../graphql/Query'
import client from '../../apollo/apolloClient'

import vis from 'vis'

const styles = theme => ({
  graph: {
    width: '100%',
    height: '100%'
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
      nodes: {
        shape: 'box',
        shadow: true
      },
      edges: {
        width: 2,
        shadow: true
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
      const conceptNodeData = []
      const conceptLinkData = []

      for (const course of courses) {
        for (const concept of course.concepts) {
          conceptNodeData.push({
            id: concept.id,
            label: concept.name,
            group: course.id
          })

          for (const conceptLink of concept.linksToConcept) {
            conceptLinkData.push({
              from: conceptLink.from.id,
              to: concept.id,
              arrows: 'to'
            })
          }
        }
      }
      init(conceptNodeData, conceptLinkData)
    }
    // Fill data and initialize the graph
    fillData()
  }, [])

  return (
    <Container>
      <div className={classes.graph} id='graph'>
      </div>
    </Container>
  )
}


export default withStyles(styles)(GraphView)
