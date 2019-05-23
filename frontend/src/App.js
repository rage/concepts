import React from 'react'
import { Route } from 'react-router-dom'
import './App.css'

import CourseView from './components/course/CourseView'
import MaterialCourseList from './components/course/MaterialCourseList'
import NavBar from './components/common/NavBar'

import { useQuery, useMutation, useApolloClient } from 'react-apollo-hooks'
import { ALL_COURSES, CREATE_COURSE, DELETE_COURSE, UPDATE_COURSE } from './services/CourseService'

const App = () => {
  const client = useApolloClient()
  const courses = useQuery(ALL_COURSES)

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const createCourse = useMutation(CREATE_COURSE, {
    update: (store, response) => {
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
  })

  const deleteCourse = useMutation(DELETE_COURSE, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_COURSES })
      const deletedCourse = response.data.deleteCourse

      if (includedIn(dataInStore.allCourses, deletedCourse)) {
        dataInStore.allCourses = dataInStore.allCourses.filter(course => {
          return course.id !== deletedCourse.id
        })
        client.writeQuery({
          query: ALL_COURSES,
          data: dataInStore
        })
      }
    }
  })

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: (store, response) => {
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
  })

  return (
    <div className="App" style={{ overflowX: 'hidden' }}>
      <NavBar />
      <Route exact path="/" render={() => <MaterialCourseList courses={courses} updateCourse={updateCourse} createCourse={createCourse} deleteCourse={deleteCourse} />} />
      <Route exact path="/courses/:id" render={({ match }) => {
        return <CourseView
          course_id={match.params.id}
          createCourse={createCourse}
          updateCourse={updateCourse}
          courses={courses}
        />
      }} />
    </div>
  )
}



export default App
