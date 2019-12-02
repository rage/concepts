import { COURSE_PREREQ_FRAGMENT, WORKSPACE_BY_ID } from '../../graphql/Query'
import client from '../apolloClient'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createObjectiveUpdate = workspaceId => (store, response) => {
  const addedObjective = response.data.createObjective
  try {
    const course = store.readFragment({
      id: addedObjective.course.id,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    if (!includedIn(course.objectives, addedObjective)) {
      store.writeFragment({
        id: addedObjective.course.id,
        fragment: COURSE_PREREQ_FRAGMENT,
        data: {
          ...course,
          objectives: [...course.objectives, addedObjective]
        }
      })
    }
  } catch (e) {
    console.error('createObjectiveUpdate', e)
  }

  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const ws = dataInStore.workspaceById
    const courseId = addedObjective.course.id
    const course = ws.courses.find(course => course.id === courseId)
    if (!includedIn(course.objectives, addedObjective)) {
      course.objectives = course.objectives.concat(addedObjective)
    }
    ws.objectiveTags = ws.objectiveTags.concat(
      addedObjective.tags.filter(tag => !ws.objectiveTags.find(ctag => ctag.id === tag.id)))
    client.writeQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId },
      data: dataInStore
    })
  } catch (e) {
    console.error('createObjectiveUpdate', e)
  }
}

const deleteObjectiveUpdate = workspaceId => (store, response) => {
  try {
    const deletedObjective = response.data.deleteObjective
    const course = store.readFragment({
      id: deletedObjective.courseId,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: deletedObjective.courseId,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        objectives: course.objectives.filter(c => c.id !== deletedObjective.id)
      }
    })
  } catch (e) {
    console.error('deleteObjectiveUpdate', e)
  }

  if (workspaceId) {
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const deletedObjective = response.data.deleteObjective
      const courseId = deletedObjective.courseId
      const course = dataInStore.workspaceById.courses.find(course => course.id === courseId)
      course.objectives = course.objectives.filter(objective => objective.id !== deletedObjective.id)
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: dataInStore
      })
    } catch (e) {
      console.error('deleteObjectiveFromByIdUpdate', e)
    }
  }
}

const updateObjectiveUpdate = workspaceId => (store, response) => {
  const updatedObjective = response.data.updateObjective
  try {
    const course = store.readFragment({
      id: updatedObjective.course.id,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: updatedObjective.course.id,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        objectives: course.objectives.map(c =>
          c.id === updatedObjective.id ? { ...c, updatedObjective } : c)
      }
    })
  } catch (e) {
    console.error('updateObjectiveUpdate', e)
  }

  try {
    const dataInStore = store.readQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId }
    })
    const ws = dataInStore.workspaceById
    ws.objectiveTags = ws.objectiveTags.concat(
      updatedObjective.tags.filter(tag => !ws.objectiveTags.find(ctag => ctag.id === tag.id)))
    client.writeQuery({
      query: WORKSPACE_BY_ID,
      variables: { id: workspaceId },
      data: dataInStore
    })
  } catch (e) {
    console.error('updateObjectiveUpdate', e)
  }
}

export {
  deleteObjectiveUpdate,
  updateObjectiveUpdate,
  createObjectiveUpdate
}
