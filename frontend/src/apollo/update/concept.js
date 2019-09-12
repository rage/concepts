import { COURSE_PREREQ_FRAGMENT, WORKSPACE_BY_ID } from '../../graphql/Query'
import client from '../apolloClient'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createConceptUpdate = (store, response) => {
  try {
    const addedConcept = response.data.createConcept
    const course = store.readFragment({
      id: addedConcept.course.id,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: addedConcept.course.id,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: [...course.concepts, addedConcept]
      }
    })
  } catch (error) { }
}

const createConceptFromByIdUpdate = (store, response, workspaceId) => {
  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const createdConcept = response.data.createConcept
    const courseId = createdConcept.course.id
    const course = dataInStore.workspaceById.courses.find(course => course.id === courseId)
    if (!includedIn(course.concepts, createdConcept)) {
      course.concepts = course.concepts.concat(createdConcept)
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: dataInStore
      })
    }
  } catch (e) { }
}

const deleteConceptUpdate = (store, response) => {
  try {
    const deletedConcept = response.data.deleteConcept
    const course = store.readFragment({
      id: deletedConcept.courseId,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: deletedConcept.courseId,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: course.concepts.filter(c => c.id !== deletedConcept.id)
      }
    })
  } catch (error) { }
}

const deleteConceptFromByIdUpdate = (store, response, workspaceId) => {
  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const deletedConcept = response.data.deleteConcept
    const courseId = deletedConcept.courseId
    const course = dataInStore.workspaceById.courses.find(course => course.id === courseId)
    course.concepts = course.concepts.filter(concept => concept.id !== deletedConcept.id)
    client.writeQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId },
      data: dataInStore
    })
  } catch (e) { }
}

const updateConceptUpdate = (store, response) => {
  try {
    const updatedConcept = response.data.updateConcept
    const course = store.readFragment({
      id: updatedConcept.course.id,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: updatedConcept.course.id,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: course.concepts.map(c => c.id === updatedConcept.id ? updatedConcept : c)
      }
    })
  } catch (error) { }
}

export {
  deleteConceptUpdate,
  deleteConceptFromByIdUpdate,
  updateConceptUpdate,
  createConceptUpdate,
  createConceptFromByIdUpdate
}
