import client from '../apolloClient'
import {
  COURSE_PREREQUISITES
} from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const deleteConceptUpdate = (courseId, workspaceId, prerequisiteCourseId) => {
  return (store, response) => {
    const dataInStore = store.readQuery({
      query: COURSE_PREREQUISITES,
      variables: {
        courseId,
        workspaceId
      }
    })

    const deletedConcept = response.data.deleteConcept
    const dataInStoreCopy = { ...dataInStore }
    const courseLink = dataInStoreCopy.courseAndPrerequisites
      .linksToCourse
      .find(link => link.from.id === prerequisiteCourseId)
    const prereqCourse = courseLink.from
    if (includedIn(prereqCourse.concepts, deletedConcept)) {
      prereqCourse.concepts = prereqCourse.concepts.filter(c => c.id !== deletedConcept.id)
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        },
        data: dataInStoreCopy
      })
    }
  }
}

const updateConceptUpdate = (courseId, workspaceId, prerequisiteCourseId) => {
  return (store, response) => {
    const dataInStore = store.readQuery({
      query: COURSE_PREREQUISITES,
      variables: {
        courseId,
        workspaceId
      }
    })

    const updatedConcept = response.data.updateConcept
    const dataInStoreCopy = { ...dataInStore }
    const courseLink = dataInStoreCopy.courseAndPrerequisites
      .linksToCourse
      .find(link => link.from.id === prerequisiteCourseId)
    const prereqCourse = courseLink.from
    if (includedIn(prereqCourse.concepts, updatedConcept)) {
      prereqCourse.concepts = prereqCourse.concepts.map(c => c.id === updatedConcept.id ? updatedConcept : c)
      client.writeQuery({
        query: COURSE_PREREQUISITES,
        variables: {
          courseId,
          workspaceId
        },
        data: dataInStoreCopy
      })
    }
  }
}

export {
  deleteConceptUpdate,
  updateConceptUpdate
}