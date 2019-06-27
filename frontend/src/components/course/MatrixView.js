import React, { useState } from 'react'
import CourseMatrix from './CourseMatrix'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'

import { useQuery } from 'react-apollo-hooks'

import Measure from 'react-measure'

import {
  COURSE_PREREQUISITES
} from '../../graphql/Query'

const MatriceView = ({ courseId, workspaceId }) => {

  const [dimensions, setDimensions] = useState({ width: -1, height: -1 })

  const courseQuery = useQuery(COURSE_PREREQUISITES, {
    variables: { courseId, workspaceId }
  })

  return (
    <React.Fragment>
      {
        courseQuery && courseQuery.data.courseAndPrerequisites ?
          <Measure
            bounds
            onResize={contentRect => {
              setDimensions(contentRect.bounds)
            }}
          >
            {({ measureRef }) => (
              <div ref={measureRef} style={{ maxWidth: '83vw', maxHeight: '90vh' }}>
                <CourseMatrix
                  dimensions={dimensions}
                  courseAndPrerequisites={courseQuery.data.courseAndPrerequisites}
                  linksToCourses={courseQuery.data.courseAndPrerequisites.linksToCourse}
                  workspaceId={workspaceId}
                />
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