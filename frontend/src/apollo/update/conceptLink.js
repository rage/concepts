import client from '../apolloClient'
import {
  COURSE_PREREQUISITES,
  COURSE_BY_ID
} from '../../graphql/Query'

const createConceptLinkUpdate = (courseId, workspaceId) => {
  return (store, response) => {
    try {
      const prereq = store.readQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        }
      })
      const course = store.readQuery({
        query: COURSE_BY_ID,
        variables: {
          id: courseId
        }
      })
      const createdConceptLink = response.data.createConceptLink

      prereq.courseAndPrerequisites.linksToCourse.forEach(courseLink => {
        const concept = courseLink.from.concepts.find(concept => {
          return concept.id === createdConceptLink.from.id
        })
        if (concept) {
          concept.linksFromConcept.push(createdConceptLink)
        }
      })
      const concept = course.courseById.concepts.find(concept => {
        return concept.id === createdConceptLink.to.id
      })
      if (concept) {
        concept.linksToConcept.push(createdConceptLink)
      }

      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        },
        data: prereq
      })
      client.writeQuery({
        query: COURSE_BY_ID,
        variables: {
          id: courseId
        },
        data: course
      })
    } catch (err) {
      return
    }
  }
}

const deleteConceptLinkUpdate = (courseId, workspaceId) => {
  return (store, response) => {
    try {
      const prereq = store.readQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        }
      })
      const course = store.readQuery({
        query: COURSE_BY_ID,
        variables: {
          id: courseId
        }
      })

      const deletedConceptLink = response.data.deleteConceptLink

      prereq.courseAndPrerequisites.linksToCourse.forEach(courseLink => {
        courseLink.from.concepts.forEach(concept => {
          concept.linksFromConcept = concept.linksFromConcept.filter(conceptLink => {
            return conceptLink.id !== deletedConceptLink.id
          })
        })
      })
      course.courseById.concepts.forEach(concept => {
        concept.linksToConcept = concept.linksToConcept.filter(conceptLink => {
          return conceptLink.id !== deletedConceptLink.id
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
      client.writeQuery({
        query: COURSE_BY_ID,
        variables: {
          id: courseId
        },
        data: course
      })
    } catch (err) {
      return
    }
  }
}

export {
  createConceptLinkUpdate,
  deleteConceptLinkUpdate
}
