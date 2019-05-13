import React from 'react'
import Course from './Course'

const CourseList = ({ courses }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>
                  ID
            </th>
            <th>
                  Name
            </th>
          </tr>
        </thead>

        <tbody>
          {
            courses.data.allCourses ?
              courses.data.allCourses.map(course => <Course key={course.id} course={course} />) :
              null
          }
        </tbody>
      </table>
    </div>
  )
}

export default CourseList