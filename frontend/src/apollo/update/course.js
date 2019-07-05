import client from '../apolloClient'
import { COURSES_BY_WORKSPACE } from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createCourseUpdate = (workspaceId) => {
  return (store, response) => {
    try {
      const dataInStore = store.readQuery({
        query: COURSES_BY_WORKSPACE,
        variables: { workspaceId }
      })
      const addedCourse = response.data.createCourse

      if (!includedIn(dataInStore.coursesByWorkspace, addedCourse)) {
        dataInStore.coursesByWorkspace.push(addedCourse)
        client.writeQuery({
          query: COURSES_BY_WORKSPACE,
          variables: { workspaceId },
          data: dataInStore
        })
      }
    } catch (e) {
      return
    }
  }
}

const updateCourseUpdate = (workspaceId) => {
  return (store, response) => {
    try {
      const dataInStore = store.readQuery({
        query: COURSES_BY_WORKSPACE,
        variables: { workspaceId }
      })
      const updatedCourse = response.data.updateCourse

      if (includedIn(dataInStore.coursesByWorkspace, updatedCourse)) {
        dataInStore.coursesByWorkspace = dataInStore.coursesByWorkspace.map(course => {
          return course.id === updatedCourse.id ? updatedCourse : course
        })
        client.writeQuery({
          query: COURSES_BY_WORKSPACE,
          variables: { workspaceId },
          data: dataInStore
        })
      }
    } catch (e) {
      return
    }
  }
}

export {
  createCourseUpdate,
  updateCourseUpdate
}
