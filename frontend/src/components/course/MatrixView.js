import React, { useState } from 'react'
import CourseMatrix from './CourseMatrix'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'

import { useQuery } from 'react-apollo-hooks'

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
      {
        course.data.courseById && prerequisites.data.courseById ?
          <Measure
            bounds
            onResize={contentRect => {
              setDimensions(contentRect.bounds)
            }}
          >
            {({ measureRef }) => (
              <div ref={measureRef} style={{ maxWidth: '83vw', maxHeight: '90vh' }}>
                <CourseMatrix dimensions={dimensions} course={course.data.courseById} prerequisiteCourses={prerequisites.data.courseById.prerequisiteCourses.filter(course =>
                  course.id !== course_id
                )} />

              </div>
            )}
          </Measure>
          :
          <Grid container
            spacing={0}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                <CircularProgress />
              </div>
            </Grid>
          </Grid>
      }
    </React.Fragment>
  )
}

export default MatriceView