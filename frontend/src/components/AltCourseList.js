import React from 'react'
import AltCourse from './AltCourse'
import AltCourseForm from './AltCourseForm'

import { useQuery, useMutation } from 'react-apollo-hooks'
import { ALL_COURSES, CREATE_COURSE } from '../services/CourseService'

const CourseList = () => {
  const courses = useQuery(ALL_COURSES)

  const createCourse = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  return (
    <div className="course-selection-container">
      <div className="course-menu">
        <div className="course-selection-column">
          {
            courses.data.allCourses ?
              courses.data.allCourses.map(course => {
                return (
                  <AltCourse key={course.id} id={course.id} text={course.name} />
                )
              })
              :
              null
          }
        </div>
      </div>
      <div className="course-input-form">
        <AltCourseForm createCourse={createCourse} />
      </div>
    </div>
  )
}

export default CourseList