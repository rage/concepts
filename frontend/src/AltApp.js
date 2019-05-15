import React from 'react'
import { Route, Link } from 'react-router-dom'
import './App.css'
import AltCourseList from './components/AltCourseList'

const App = () => {
  return (
    <div className="App">
      <div className="nav">
        <Link to="/">Courses</Link>
      </div>
      <Route exact path="/" render={() => <AltCourseList />} />

      {/* <div className="curri-column-container">
        {this.state.prequisites.map(course =>
          <CourseColumn
            key={course.courseName}
            course={course.courseName}
            topics={course.topics}
          />
        )}
      </div> */}

      {/* <div className="right-menu">
        <div className="right-menu-splitter">
          <CourseColumn
            course={}
            topics={}
          />
          <button
            className="curri-button send"
            style={{ backgroundColor: '#e8e8e8' }}
            onClick={}>
            Save
          </button>
        </div>
      </div>

      <button className="curri-button bottom-button" onClick={this.changeView}>Vaihda näkymää</button> */}
    </div>
  )
}



export default App
