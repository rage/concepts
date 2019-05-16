import React from 'react'
import { Route, Link } from 'react-router-dom'
import './App.css'

import AltCourseList from './components/course/AltCourseList'
import CourseView from './components/course/CourseView'

const App = () => {
  return (
    <div className="App">
      <div className="nav">
        <Link to="/">Courses</Link>

      </div>
      <Route exact path="/" render={() => <AltCourseList />} />
      <Route exact path="/courses/:id" render={({ match }) => {
        return <CourseView
          course_id={match.params.id}
        />
      }} />
    </div>
  )
}



export default App
