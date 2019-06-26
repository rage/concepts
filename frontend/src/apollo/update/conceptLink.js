import client from '../apolloClient'
import {
  FETCH_COURSE_AND_PREREQUISITES
} from '../../graphql/Query'

const createConceptLinkUpdate = (courseId, workspaceId) => {
  return (store, response) => {
    try {
      const dataInStore = store.readQuery({
        query: FETCH_COURSE_AND_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        }
      })
      const createdConceptLink = response.data.createConceptLink
      const dataInStoreCopy = { ...dataInStore }

      dataInStoreCopy.courseAndPrerequisites.linksToCourse.forEach(courseLink => {
        const concept = courseLink.from.concepts.find(concept => concept.id === createdConceptLink.from.id)
        if (concept) {
          concept.linksFromConcept.push(createdConceptLink)
        }
      })

      client.writeQuery({
        query: FETCH_COURSE_AND_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        },
        data: dataInStoreCopy
      })
    } catch (err) {

    }
  }
}

const deleteConceptLinkUpdate = (courseId, workspaceId) => {
  return (store, response) => {
    try {
      const dataInStore = store.readQuery({
        query: FETCH_COURSE_AND_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        }
      })

      const deletedConceptLink = response.data.deleteConceptLink
      const dataInStoreCopy = { ...dataInStore }

      dataInStoreCopy.courseAndPrerequisites.linksToCourse.forEach(courseLink => {
        courseLink.from.concepts.forEach(concept => {
          concept.linksFromConcept = concept.linksFromConcept.filter(conceptLink => conceptLink.id !== deletedConceptLink.id)
        })
      })

      client.writeQuery({
        query: FETCH_COURSE_AND_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        },
        data: dataInStoreCopy
      })
    } catch (err) {

    }
  }
}

export {
  createConceptLinkUpdate,
  deleteConceptLinkUpdate
}