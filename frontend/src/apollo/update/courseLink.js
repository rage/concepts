import { COURSE_PREREQUISITES } from '../../graphql/Query'
import client from '../apolloClient'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createCourseLinkUpdate = (workspaceId, activeCourseId) =>
  (store, response) => {
    const dataInStore = store.readQuery({
      query: COURSE_PREREQUISITES,
      variables: { courseId: activeCourseId, workspaceId }
    })
    const addedCourseLink = response.data.createCourseLink
    const dataInStoreCopy = { ...dataInStore }
    const courseLinks = dataInStoreCopy.courseAndPrerequisites.linksToCourse
    if (!includedIn(courseLinks, addedCourseLink)) {
      courseLinks.push(addedCourseLink)
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId: activeCourseId, workspaceId },
        data: dataInStoreCopy
      })
    }
  }

const updateCourseLinkUpdate = (workspaceId, activeCourseId) =>
  (store, response) => {
    const dataInStore = store.readQuery({
      query: COURSE_PREREQUISITES,
      variables: { courseId: activeCourseId, workspaceId }
    })
    const updatedCourseLink = response.data.updateCourseLink
    const dataInStoreCopy = { ...dataInStore }
    const courseLinks = dataInStoreCopy.courseAndPrerequisites.linksToCourse
    if (includedIn(courseLinks, updatedCourseLink)) {
      dataInStoreCopy.courseAndPrerequisites.linksToCourse = courseLinks.map(link =>
        link.id === updatedCourseLink.id ? { ...link, ...updatedCourseLink } : link)
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId: activeCourseId, workspaceId },
        data: dataInStoreCopy
      })
    }
  }

const deleteCourseLinkUpdate = (workspaceId, activeCourseId) =>
  (store, response) => {
    const dataInStore = store.readQuery({
      query: COURSE_PREREQUISITES,
      variables: { courseId: activeCourseId, workspaceId }
    })
    const removedCourseLink = response.data.deleteCourseLink
    const dataInStoreCopy = { ...dataInStore }
    const courseLinks = dataInStoreCopy.courseAndPrerequisites.linksToCourse
    if (includedIn(courseLinks, removedCourseLink)) {
      dataInStoreCopy.courseAndPrerequisites.linksToCourse = courseLinks
        .filter(course => course.id !== removedCourseLink.id)
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId: activeCourseId, workspaceId },
        data: dataInStoreCopy
      })
    }
  }

export {
  createCourseLinkUpdate,
  deleteCourseLinkUpdate,
  updateCourseLinkUpdate
}
