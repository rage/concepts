import React, { useEffect } from 'react'
import Container from '@material-ui/core/Container'
import { withStyles } from '@material-ui/core'
import {
  FETCH_COURSE_AND_PREREQUISITES
} from '../../graphql/Query'
import client from '../../apollo/apolloClient'

import vis from 'vis'

const styles = theme => ({
  graph: {
    width: '100%',
    height: '100%'
  }
})

const GraphView = ({ classes, workspaceId, courseId }) => {

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
        shadow:true
      }
    }
    new vis.Network(container, {
      nodes,
      edges
    }, options)
  }

  useEffect( () => {
    // Prepare data for loader
    const fillData = async () => {
      const response = await client.query({
        query: FETCH_COURSE_AND_PREREQUISITES,
        variables: {
          workspaceId,
          courseId
        }
      })
      const courseAndPrerequisites = response.data.courseAndPrerequisites

      // Initialize data for states
      const conceptNodeData = []
      const conceptLinkData = []

      // Create concept nodes for the main course
      for (const concept of courseAndPrerequisites.concepts) {
        conceptNodeData.push({
          id: concept.id,
          label: concept.name
          // group: courseAndPrerequisites.id
        })
      }

      // Create concept nodes for prerequisite courses
      for (const courseLink of courseAndPrerequisites.linksToCourse) {
        const prerequisiteCourse = courseLink.from
        for (const prerequisiteConcept of prerequisiteCourse.concepts) {
          // Disallow duplicate concepts
          if (typeof conceptNodeData.find(concept => {
            return concept.id === prerequisiteConcept.id
          }) === 'undefined') {
            conceptNodeData.push({
              id: prerequisiteConcept.id,
              label: prerequisiteConcept.name
              // group: prerequisiteCourse.id
            })
          }

          for (const conceptLink of prerequisiteConcept.linksFromConcept) {
            conceptLinkData.push({
              from: prerequisiteConcept.id,
              to: conceptLink.to.id,
              arrows: 'from'
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
