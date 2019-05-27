import React, { useState } from 'react'
import CourseMatrice from './CourseMatrice'

import { useQuery, useMutation } from 'react-apollo-hooks'
import {
  LINK_PREREQUISITE,
  DELETE_LINK,
} from '../../services/ConceptService'

import {
  FETCH_COURSE,
  COURSE_PREREQUISITE_COURSES
} from '../../services/CourseService'


const MatriceView = ({ course_id }) => {

  const course = useQuery(FETCH_COURSE, {
    variables: { id: course_id }
  })

  const prerequisites = useQuery(COURSE_PREREQUISITE_COURSES, {
    variables: { id: course_id }
  })

  return (
    <React.Fragment>
      {
        course.data.courseById && prerequisites.data.courseById ?
          <CourseMatrice course={course.data.courseById} prerequisiteCourses={prerequisites.data.courseById.prerequisiteCourses.filter(course =>
            course.id !== course_id
          )} /> :
          null
      }
    </React.Fragment>
  )
}

export default MatriceView