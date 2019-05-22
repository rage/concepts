import React from 'react'
import { Route } from 'react-router-dom'
import './App.css'

import CourseView from './components/course/CourseView'
import MaterialCourseList from './components/course/MaterialCourseList'
import NavBar from './components/common/NavBar'

const App = () => {
  return (
    <div className="App">
      <NavBar />
      <Route exact path="/" render={() => <MaterialCourseList />} />
      <Route exact path="/courses/:id" render={({ match }) => {
        return <CourseView
          course_id={match.params.id}
        />
      }} />
    </div>
  )
}



export default App
