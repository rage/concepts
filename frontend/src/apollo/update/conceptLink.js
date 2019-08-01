import client from '../apolloClient'
import {
  COURSE_PREREQUISITES,
  COURSE_BY_ID
} from '../../graphql/Query'

const createConceptLinkUpdate = (courseId, workspaceId) =>
  (store, response) => {
    try {
      const prereq = store.readQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        }
      })
      const createdConceptLink = response.data.createConceptLink

      prereq.courseAndPrerequisites.linksToCourse.forEach(courseLink => {
        const concept = courseLink.from.concepts
          .find(concept => concept.id === createdConceptLink.from.id)
        if (concept) {
          concept.linksFromConcept.push(createdConceptLink)
        }
      })
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        },
        data: prereq
      })

      const course = store.readQuery({
        query: COURSE_BY_ID,
        variables: {
          id: courseId
        }
      })

      const concept = course.courseById.concepts
        .find(concept => concept.id === createdConceptLink.to.id)
      if (concept) {
        concept.linksToConcept.push(createdConceptLink)
      }

      client.writeQuery({
        query: COURSE_BY_ID,
        variables: {
          id: courseId
        },
        data: course
      })
    } catch (err) {}
  }

const deleteConceptLinkUpdate = (courseId, workspaceId) =>
  (store, response) => {
    try {
      const prereq = store.readQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        }
      })

      const deletedConceptLink = response.data.deleteConceptLink

      prereq.courseAndPrerequisites.linksToCourse.forEach(courseLink => {
        courseLink.from.concepts.forEach(concept => {
          concept.linksFromConcept = concept.linksFromConcept
            .filter(conceptLink => conceptLink.id !== deletedConceptLink.id)
        })
      })

      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        },
        data: prereq
      })

      const course = store.readQuery({
        query: COURSE_BY_ID,
        variables: {
          id: courseId
        }
      })

      course.courseById.concepts.forEach(concept => {
        concept.linksToConcept = concept.linksToConcept
          .filter(conceptLink => conceptLink.id !== deletedConceptLink.id)
      })

      client.writeQuery({
        query: COURSE_BY_ID,
        variables: {
          id: courseId
        },
        data: course
      })
    } catch (err) {}
  }

export {
  createConceptLinkUpdate,
  deleteConceptLinkUpdate
}
