import React, { useState } from 'react'
import CourseMatrice from './CourseMatrice'

import { useQuery} from 'react-apollo-hooks'

import Measure from 'react-measure'

import {
  FETCH_COURSE,
  COURSE_PREREQUISITE_COURSES
} from '../../services/CourseService'


const MatriceView = ({ course_id }) => {

  const [dimensions, setDimensions] = useState({ width: -1, height: -1 })


  const course = useQuery(FETCH_COURSE, {
    variables: { id: course_id }
  })

  const prerequisites = useQuery(COURSE_PREREQUISITE_COURSES, {
    variables: { id: course_id }
  })

  return (
    <React.Fragment>
      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} style={{ maxWidth: '83vw', maxHeight: '90vh' }}>
            {
              course.data.courseById && prerequisites.data.courseById ?
                <CourseMatrice dimensions={dimensions} course={course.data.courseById} prerequisiteCourses={prerequisites.data.courseById.prerequisiteCourses.filter(course =>
                  course.id !== course_id
                )} /> :
                null
            }
          </div>
        )}
      </Measure>
    </React.Fragment>
  )
}

export default MatriceView