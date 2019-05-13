import React from 'react'
import { Route, Link } from 'react-router-dom'

import ConceptList from './components/ConceptList'
import CourseList from './components/CourseList'

import './App.css'

const App = () => {
  return (
    <div className="App">
      <div>
        <Link to="/">Courses</Link>
      </div>
      <Route exact path="/" render={() => <CourseList />} />
      <Route exact path="/courses/:id" render={({ match }) => {
        return <ConceptList
          course_id={match.params.id}
        />
      }} />

    </div >
  )
}

export default App
