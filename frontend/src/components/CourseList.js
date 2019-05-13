import React from 'react'
import Course from './Course'
import CourseForm from './CourseForm'

import { useQuery, useMutation } from 'react-apollo-hooks'
import { ALL_COURSES, CREATE_COURSE } from '../services/CourseService'

const CourseList = () => {
  const courses = useQuery(ALL_COURSES)

  const createCourse = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })
  return (
    <div className="courseList">
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
      <CourseForm createCourse={createCourse} />
    </div>
  )
}

export default CourseList