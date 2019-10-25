import client from '../apolloClient'
import { WORKSPACE_BY_ID, COURSE_PREREQUISITES } from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createCourseUpdate = (workspaceId) =>
  (store, response) => {
    // Update WORKSPACE_BY_ID
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const addedCourse = response.data.createCourse
      if (!includedIn(dataInStore.workspaceById.courses, addedCourse)) {
        dataInStore.workspaceById.courses.push(addedCourse)
      }
      const ws = dataInStore.workspaceById
      ws.courseTags = ws.courseTags.concat(
        addedCourse.tags.filter(tag => !ws.courseTags.find(ctag => ctag.id === tag.id)))
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: dataInStore
      })
    } catch (e) {
      console.error('createCourseUpdate', e)
    }
  }

const updateCourseUpdate = (workspaceId) =>
  (store, response) => {
    // Update WORKSPACE_BY_ID
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const updatedCourse = response.data.updateCourse
      const ws = dataInStore.workspaceById
      if (includedIn(ws.courses, updatedCourse)) {
        ws.courses = ws.courses
          .map(course => course.id === updatedCourse.id ? { ...course, ...updatedCourse } : course)
      }
      ws.courseTags = ws.courseTags.concat(
        updatedCourse.tags.filter(tag => !ws.courseTags.find(ctag => ctag.id === tag.id)))
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: dataInStore
      })
    } catch (e) {
      console.error('updateCourseUpdate', e)
    }
  }

const deleteCourseUpdate = (workspaceId, activeCourseId) =>
  (store, response) => {
    // Update WORKSPACE_BY_ID
    try {
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const deletedCourse = response.data.deleteCourse
      const ws = dataInStore.workspaceById
      if (includedIn(ws.courses, deletedCourse)) {
        ws.courses = ws.courses.filter(course => course.id !== deletedCourse.id)
        client.writeQuery({
          query: WORKSPACE_BY_ID,
          variables: { id: workspaceId },
          data: dataInStore
        })
      }
    } catch (e) {
      console.error('deleteCourseUpdate', e)
    }
    // Update course prerequisites
    try {
      const dataInStore = store.readQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId: activeCourseId }
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
    } catch (e) {
      console.error('deleteCourseUpdate', e)
    }
  }

export {
  createCourseUpdate,
  updateCourseUpdate,
  deleteCourseUpdate
}
