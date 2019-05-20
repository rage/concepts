import React from 'react'
import AltCourse from './AltCourse'
import AltCourseForm from './AltCourseForm'
import MaterialCourseList from './MaterialCourseList'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { ALL_COURSES, CREATE_COURSE } from '../../services/CourseService'

const CourseList = () => {
  const courses = useQuery(ALL_COURSES)

  const createCourse = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  return (
    <div>
      <div>
        <div >
          <MaterialCourseList/>
          
        </div>
      </div>
      <div className="course-input-form">
        <AltCourseForm createCourse={createCourse} />
      </div>
    </div>
  )
}

export default CourseList