import { COURSE_PREREQUISITES } from '../../graphql/Query'
import client from '../apolloClient'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createCourseLinkUpdate = (workspaceId) =>
  (store, response) => {
    const addedCourseLink = response.data.createCourseLink
    const dataInStore = store.readQuery({
      query: COURSE_PREREQUISITES,
      variables: { courseId: addedCourseLink.to.id, workspaceId }
    })
    const dataInStoreCopy = { ...dataInStore }
    const courseLinks = dataInStoreCopy.courseAndPrerequisites.linksToCourse
    if (!includedIn(courseLinks, addedCourseLink)) {
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId: addedCourseLink.to.id, workspaceId },
        data: {
          ...dataInStoreCopy,
          courseAndPrerequisites: {
            ...dataInStoreCopy.courseAndPrerequisites,
            linksToCourse: [...courseLinks, addedCourseLink]
          }
        }
      })
    }
  }

const updateCourseLinkUpdate = (workspaceId) =>
  (store, response) => {
    const updatedCourseLink = response.data.updateCourseLink
    const dataInStore = store.readQuery({
      query: COURSE_PREREQUISITES,
      variables: { courseId: updatedCourseLink.to.id, workspaceId }
    })
    const dataInStoreCopy = { ...dataInStore }
    const courseLinks = dataInStoreCopy.courseAndPrerequisites.linksToCourse
    if (includedIn(courseLinks, updatedCourseLink)) {
      dataInStoreCopy.courseAndPrerequisites.linksToCourse = courseLinks.map(link =>
        link.id === updatedCourseLink.id ? { ...link, ...updatedCourseLink } : link)
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId: updatedCourseLink.to.id, workspaceId },
        data: dataInStoreCopy
      })
    }
  }

const deleteCourseLinkUpdate = (workspaceId) =>
  (store, response) => {
    const deletedCourseLink = response.data.deleteCourseLink
    const dataInStore = store.readQuery({
      query: COURSE_PREREQUISITES,
      variables: { courseId: deletedCourseLink.courseId, workspaceId }
    })
    const dataInStoreCopy = { ...dataInStore }
    const courseLinks = dataInStoreCopy.courseAndPrerequisites.linksToCourse
    if (includedIn(courseLinks, deletedCourseLink)) {
      dataInStoreCopy.courseAndPrerequisites.linksToCourse = courseLinks
        .filter(course => course.id !== deletedCourseLink.id)
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId: deletedCourseLink.courseId, workspaceId },
        data: dataInStoreCopy
      })
    }
  }

export {
  createCourseLinkUpdate,
  deleteCourseLinkUpdate,
  updateCourseLinkUpdate
}
