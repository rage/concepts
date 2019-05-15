import React from 'react'

import { useQuery } from 'react-apollo-hooks'
import { ALL_COURSES } from '../services/CourseService'

import CourseContainer from './CourseContainer'
import CourseTray from './CourseTray'
import ActiveCourse from './ActiveCourse'

const CourseView = ({ course_id }) => {
  const courses = useQuery(ALL_COURSES)
  console.log('course')

  return (
    <div>
      {
        courses.data.allCourses ?
          <div className="course-view">
            <ActiveCourse course={courses.data.allCourses[0]}/>
            <CourseContainer courses={courses.data.allCourses}/>
            <CourseTray courses={courses.data.allCourses}/>
          </div> :
          null
      }
    </div>
  )
}

export default CourseView