import client from '../apolloClient'
import { ALL_COURSES } from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const createCourseUpdate = () => {
  return (store, response) => {
    const dataInStore = store.readQuery({ query: ALL_COURSES })
    const addedCourse = response.data.createCourse

    if (!includedIn(dataInStore.allCourses, addedCourse)) {
      dataInStore.allCourses.push(addedCourse)
      client.writeQuery({
        query: ALL_COURSES,
        data: dataInStore
      })
    }
  }
}

const updateCourseUpdate = () => {
  return (store, response) => {
    const dataInStore = store.readQuery({ query: ALL_COURSES })
    const updatedCourse = response.data.updateCourse

    if (includedIn(dataInStore.allCourses, updatedCourse)) {
      dataInStore.allCourses = dataInStore.allCourses.map(course => {
        return course.id === updatedCourse.id ? updatedCourse : course
      })
      client.writeQuery({
        query: ALL_COURSES,
        data: dataInStore
      })
    }
  }
}

export {
  createCourseUpdate,
  updateCourseUpdate
}