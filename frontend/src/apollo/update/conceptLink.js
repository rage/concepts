import client from '../apolloClient'
import { LINKS_IN_COURSE, WORKSPACE_COURSES_AND_CONCEPTS } from '../../graphql/Query'
import * as objectRecursion from '../../lib/objectRecursion'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const updateConceptLinkUpdate = () => 
  (store, response) => {
    try {
      const updatedConceptLink = response.data.updateConceptLink
      const dataInStore = store.readQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId: updatedConceptLink.to.course.id }
      })
      const dataInStoreCopy = { ...dataInStore }
      const concept = dataInStoreCopy.linksInCourse.concepts
        .find(concept => concept.id === updatedConceptLink.to.id)
      
      if (concept) {
        concept.linksToConcept = concept.linksToConcept
          .map(conceptLink => conceptLink.id === updatedConceptLink.id ? updatedConceptLink : conceptLink)
      }
  
      client.writeQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId: updatedConceptLink.to.course.id },
        data: dataInStoreCopy
      })
    } catch (e) {
      console.error('updateConceptLinkUpdate', e)
    }
}

const createConceptLinkUpdate = () =>
  (store, response) => {
    try {
      const createdConceptLink = response.data.createConceptLink

      const course = store.readQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId: createdConceptLink.to.course.id }
      })

      const concept = course.linksInCourse.concepts
        .find(concept => concept.id === createdConceptLink.to.id)
      if (concept && !includedIn(concept.linksToConcept, createdConceptLink)) {
        concept.linksToConcept.push(createdConceptLink)
      }

      client.writeQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId: createdConceptLink.to.course.id },
        data: course
      })
    } catch (e) {
      console.error('createConceptLinkUpdate', e)
    }
  }

const deleteConceptLinkUpdate = () =>
  (store, response) => {
    try {
      const deletedConceptLink = response.data.deleteConceptLink

      const course = store.readQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId: deletedConceptLink.courseId }
      })

      course.linksInCourse.concepts.forEach(concept => {
        concept.linksToConcept = concept.linksToConcept
          .filter(conceptLink => conceptLink.id !== deletedConceptLink.id)
      })

      client.writeQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId: deletedConceptLink.courseId },
        data: course
      })
    } catch (e) {
      console.error('deleteConceptLinkUpdate', e)
    }
  }

const deleteConceptLinkRecursiveUpdate = workspaceId => (client, response) => {
  const { deleteConceptLink } = response.data
  const { id, courseId, conceptId } = deleteConceptLink
  const data = client.readQuery({
    query: WORKSPACE_COURSES_AND_CONCEPTS,
    variables: { id: workspaceId }
  })

  const obj = objectRecursion.get(data,
    `workspaceById.courses[id=${courseId}].concepts[id=${conceptId}]`)
  obj.linksToConcept = obj.linksToConcept.filter(link =>
    link.__typename !== 'DeletedConceptLink' && link.id !== id)

  client.writeQuery({
    query: WORKSPACE_COURSES_AND_CONCEPTS,
    variables: { id: workspaceId },
    data
  })
}

const createConceptLinkRecursiveUpdate = workspaceId => (client, response) => {
  const { createConceptLink } = response.data
  const data = client.readQuery({
    query: WORKSPACE_COURSES_AND_CONCEPTS,
    variables: { id: workspaceId }
  })
  const courseId = createConceptLink.to.course.id
  const conceptId = createConceptLink.to.id
  const path = `workspaceById.courses[id=${courseId}].concepts[id=${conceptId}].linksToConcept`
  objectRecursion.push(data, path, createConceptLink)

  client.writeQuery({
    query: WORKSPACE_COURSES_AND_CONCEPTS,
    variables: { id: workspaceId },
    data
  })
}

export {
  updateConceptLinkUpdate,
  createConceptLinkUpdate,
  deleteConceptLinkUpdate,
  createConceptLinkRecursiveUpdate,
  deleteConceptLinkRecursiveUpdate
}
