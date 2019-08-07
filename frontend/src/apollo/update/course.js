import client from '../apolloClient'
import {
  WORKSPACE_BY_ID, COURSES_FOR_WORKSPACE_FRAGMENT, COURSE_PREREQUISITES
} from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createCourseUpdate = (workspaceId) =>
  (store, response) => {
    // Update other
    try {
      const addedCourse = response.data.createCourse
      const workspace = store.readFragment({
        id: workspaceId,
        fragment: COURSES_FOR_WORKSPACE_FRAGMENT
      })
      store.writeFragment({
        id: workspaceId,
        fragment: COURSES_FOR_WORKSPACE_FRAGMENT,
        data: {
          ...workspace,
          courses: [...workspace.courses, addedCourse]
        }
      })
    } catch (error) { }
    // Update WORKSPACE_BY_ID
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const addedCourse = response.data.createCourse
      if (!includedIn(dataInStore.workspaceById.courses, addedCourse)) {
        dataInStore.workspaceById.courses.push(addedCourse)
        client.writeQuery({
          query: WORKSPACE_BY_ID,
          variables: { id: workspaceId },
          data: dataInStore
        })
      }
    } catch (e) { }
  }

const updateCourseUpdate = (workspaceId) =>
  (store, response) => {
    // Update other
    try {
      const updatedCourse = response.data.updateCourse
      const workspace = store.readFragment({
        id: workspaceId,
        fragment: COURSES_FOR_WORKSPACE_FRAGMENT
      })
      store.writeFragment({
        id: workspaceId,
        fragment: COURSES_FOR_WORKSPACE_FRAGMENT,
        data: {
          ...workspace,
          courses: workspace.courses.map(c => c.id === updatedCourse.id ? updatedCourse : c)
        }
      })
    } catch (error) { }
    // Update WORKSPACE_BY_ID
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const updatedCourse = response.data.updateCourse
      if (includedIn(dataInStore.workspaceById.courses, updatedCourse)) {
        dataInStore.workspaceById.courses = dataInStore.workspaceById.courses
          .map(course => course.id === updatedCourse.id ? updatedCourse : course)
        client.writeQuery({
          query: WORKSPACE_BY_ID,
          variables: { id: workspaceId },
          data: dataInStore
        })
      }
    } catch (e) { }
  }

const deleteCourseUpdate = (workspaceId, activeCourseId) =>
  (store, response) => {
    // Update other
    try {
      const deletedCourse = response.data.deleteCourse
      const workspace = store.readFragment({
        id: workspaceId,
        fragment: COURSES_FOR_WORKSPACE_FRAGMENT
      })
      store.writeFragment({
        id: workspaceId,
        fragment: COURSES_FOR_WORKSPACE_FRAGMENT,
        data: {
          ...workspace,
          courses: workspace.courses.filter(c => c.id !== deletedCourse.id)
        }
      })
    } catch (error) { }
    // Update WORKSPACE_BY_ID
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const deletedCourse = response.data.deleteCourse
      if (includedIn(dataInStore.workspaceById.courses, deletedCourse)) {
        dataInStore.workspaceById.courses = dataInStore.workspaceById.courses
          .filter(course => course.id !== deletedCourse.id)
        client.writeQuery({
          query: WORKSPACE_BY_ID,
          variables: { id: workspaceId },
          data: dataInStore
        })
      }
    } catch (e) { }
    // Update course prerequisites
    try {
      const dataInStore = store.readQuery({
        query: COURSE_PREREQUISITES,
        variables: { workspaceId, courseId: activeCourseId }
      })
      const deletedCourse = response.data.deleteCourse
      const courseLinks = dataInStore.courseAndPrerequisites.linksToCourse
      if (includedIn(courseLinks.map(l => l.from), deletedCourse)) {
        dataInStore.courseAndPrerequisites.linksToCourse = courseLinks
          .filter(link => link.from.id !== deletedCourse.id)
        client.writeQuery({
          query: COURSE_PREREQUISITES,
          variables: { workspaceId, courseId: activeCourseId },
          data: dataInStore
        })
      }
    } catch (e) { }
  }

export {
  createCourseUpdate,
  updateCourseUpdate,
  deleteCourseUpdate
}
