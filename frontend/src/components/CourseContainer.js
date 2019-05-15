import React from 'react'
import Course from './Course'

const CourseContainer = ({ courses }) => (
  <div className="curri-column-container">
    {
      courses && courses.map(course => <Course key={course.id} course={course}/> )
    }
  </div>
)

export default CourseContainer