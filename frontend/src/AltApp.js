import React from 'react'
import { Route, Link } from 'react-router-dom'
import './App.css'

import AltCourseList from './components/course/AltCourseList'
import CourseView from './components/course/CourseView'
import MaterialCourseList from './components/course/MaterialCourseList'

const App = () => {
  return (
    <div className="App">
      <div className="nav">
        <Link to="/">Courses</Link>
      </div>
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
