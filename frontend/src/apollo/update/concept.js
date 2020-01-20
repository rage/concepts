import { COURSE_PREREQ_FRAGMENT, WORKSPACE_BY_ID } from '../../graphql/Query'
import client from '../apolloClient'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createConceptUpdate = workspaceId => (store, response) => {
  const addedConcept = response.data.createConcept || response.data.createConceptFromCommon
  if (addedConcept.level !== 'COMMON') {
    try {
      const course = store.readFragment({
        id: addedConcept.course.id,
        fragment: COURSE_PREREQ_FRAGMENT
      })
      if (!includedIn(course.concepts, addedConcept)) {
        store.writeFragment({
          id: addedConcept.course.id,
          fragment: COURSE_PREREQ_FRAGMENT,
          data: {
            ...course,
            concepts: [...course.concepts, addedConcept]
          }
        })
      }
    } catch (e) {
      console.error('createConceptUpdate', e)
    }
  }

  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const ws = dataInStore.workspaceById
    if (addedConcept.level === 'COMMON') {
      if (!includedIn(ws.commonConcepts, addedConcept)) {
        ws.commonConcepts = ws.commonConcepts.concat(addedConcept)
      }
    } else {
      const courseId = addedConcept.course.id
      const course = ws.courses.find(course => course.id === courseId)
      if (!includedIn(course.concepts, addedConcept)) {
        course.concepts = course.concepts.concat(addedConcept)
      }
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

const deleteConceptUpdate = workspaceId => (store, response) => {
  const deletedConcept = response.data.deleteConcept
  if (deletedConcept.courseId) {
    try {
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

  if (workspaceId) {
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      if (deletedConcept.courseId) {
        const courseId = deletedConcept.courseId
        const course = dataInStore.workspaceById.courses.find(course => course.id === courseId)
        course.concepts = course.concepts.filter(concept => concept.id !== deletedConcept.id)
      }
      dataInStore.workspaceById.commonConcepts = dataInStore.workspaceById.commonConcepts
        .filter(concept => concept.id !== deletedConcept.id)
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: dataInStore
      })
    } catch (e) {
      console.error('deleteConceptFromByIdUpdate', e)
    }
  }
}

const deleteManyConceptsUpdate = workspaceId => (store, response) => {
  const deletedConcepts = response.data.deleteManyConcepts
  const ids = new Set(deletedConcepts.ids)
  const courseId = deletedConcepts.courseId
  try {
    const course = store.readFragment({
      id: courseId,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: courseId,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: course.concepts.filter(c => !ids.has(c.id))
      }
    })
  } catch (e) {
    console.error('deleteManyConceptsUpdate', e)
  }

  if (workspaceId) {
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const course = dataInStore.workspaceById.courses.find(course => course.id === courseId)
      course.concepts = course.concepts.filter(concept => !ids.has(concept.id))
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: dataInStore
      })
    } catch (e) {
      console.error('deleteManyConceptsFromByIdUpdate', e)
    }
  }
}

const updateConceptUpdate = workspaceId => (store, response) => {
  const updatedConcept = response.data.updateConcept
  if (updatedConcept.course) {
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
  }

  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const ws = dataInStore.workspaceById
    ws.conceptTags = ws.conceptTags.concat(
      updatedConcept.tags.filter(tag => !ws.conceptTags.find(ctag => ctag.id === tag.id)))
    if (updatedConcept.level === 'COMMON') {
      ws.commonConcepts = ws.commonConcepts.map(c =>
        c.id === updatedConcept.id ? { ...c, updatedConcept } : c)
    }
    client.writeQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId },
      data: dataInStore
    })
  } catch (e) {
    console.error('updateConceptUpdate', e)
  }
}

const updateManyConceptsUpdate = workspaceId => (store, response) => {
  const updatedConcepts = response.data.updateManyConcepts
  const courseId = updatedConcepts[0].course.id
  try {
    const course = store.readFragment({
      id: courseId,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    const updatedConceptMap = new Map(updatedConcepts.map(concept => [concept.id, concept]))
    store.writeFragment({
      id: courseId,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: course.concepts.map(concept => updatedConceptMap.has(concept.id)
          ? { ...concept, ...updatedConceptMap.get(concept.id) } : concept)
      }
    })
  } catch (e) {
    console.error('updateManyConceptsUpdate', e)
  }

  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const ws = dataInStore.workspaceById
    const tagIds = new Set(ws.conceptTags.map(tag => tag.id))
    const tags = [...ws.conceptTags]
    for (const concept of updatedConcepts) {
      for (const tag of concept.tags) {
        if (!tagIds.has(tag.id)) {
          tagIds.add(tag.id)
          tags.push(tag)
        }
      }
    }
    ws.conceptTags = tags
    client.writeQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId },
      data: dataInStore
    })
  } catch (e) {
    console.error('updateManyConceptsUpdate', e)
  }
}

export {
  deleteConceptUpdate,
  deleteManyConceptsUpdate,
  updateConceptUpdate,
  updateManyConceptsUpdate,
  createConceptUpdate
}
