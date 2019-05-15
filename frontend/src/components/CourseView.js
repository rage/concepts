import React from 'react'

import { useQuery } from 'react-apollo-hooks'
import { ALL_COURSES, COURSE_AND_CONCEPTS } from '../services/CourseService'

import CourseContainer from './CourseContainer'
import CourseTray from './CourseTray'
import ActiveCourse from './ActiveCourse'

const CourseView = ({ course_id }) => {
  const courses = useQuery(ALL_COURSES)

  const { data, loading } = useQuery(COURSE_AND_CONCEPTS, {
    variables: { id: course_id }
  })

  return (
    <div>
      {
        data.courseById && courses.data.allCourses ?
          <div className="course-view">
            <ActiveCourse course={data.courseById}/>
            <CourseContainer courses={courses.data.allCourses.filter(course => course.id !== course_id)}/>
            <CourseTray courses={courses.data.allCourses}/>
          </div> :
          null
      }
    </div>
  )
}

export default CourseView