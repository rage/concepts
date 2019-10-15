import { COURSE_PREREQ_FRAGMENT, WORKSPACE_BY_ID } from '../../graphql/Query'
import client from '../apolloClient'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createConceptUpdate = workspaceId => (store, response) => {
  const addedConcept = response.data.createConcept
  try {
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
  } catch (e) {
    console.error('createConceptUpdate', e)
  }

  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const ws = dataInStore.workspaceById
    const courseId = addedConcept.course.id
    const course = ws.courses.find(course => course.id === courseId)
    if (!includedIn(course.concepts, addedConcept)) {
      course.concepts = course.concepts.concat(addedConcept)
    }
    ws.conceptTags = ws.conceptTags.concat(
      addedConcept.tags.filter(tag => !ws.conceptTags.find(ctag => ctag.id === tag.id)))
    client.writeQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId },
      data: dataInStore
    })
  } catch (e) {
    console.error('createConceptUpdate', e)
  }
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
  } catch (e) {
    console.error('deleteConceptUpdate', e)
  }
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
  } catch (e) {
    console.error('deleteConceptFromByIdUpdate', e)
  }
}

const updateConceptUpdate = workspaceId => (store, response) => {
  const updatedConcept = response.data.updateConcept
  try {
    const course = store.readFragment({
      id: updatedConcept.course.id,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: updatedConcept.course.id,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: course.concepts.map(c =>
          c.id === updatedConcept.id ? { ...c, updatedConcept } : c)
      }
    })
  } catch (e) {
    console.error('updateConceptUpdate', e)
  }

  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const ws = dataInStore.workspaceById
    ws.conceptTags = ws.conceptTags.concat(
      updatedConcept.tags.filter(tag => !ws.conceptTags.find(ctag => ctag.id === tag.id)))
    client.writeQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId },
      data: dataInStore
    })
  } catch (e) {
    console.error('updateConceptUpdate', e)
  }
}

export {
  deleteConceptUpdate,
  deleteConceptFromByIdUpdate,
  updateConceptUpdate,
  createConceptUpdate
}
