import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'

import { useQuery } from 'react-apollo-hooks'
import CircularProgress from '@material-ui/core/CircularProgress'

import {
  FETCH_COURSE,
  COURSE_PREREQUISITE_COURSES
} from '../../services/CourseService'

import CourseContainer from './CourseContainer'
import CourseTray from './CourseTray'
import ActiveCourse from './ActiveCourse'

const CourseView = ({ course_id, createCourse, updateCourse, courses }) => {
  const [activeConceptIds, setActiveConceptIds] = useState([])
  const [courseTrayOpen, setCourseTrayOpen] = useState(false)

  const course = useQuery(FETCH_COURSE, {
    variables: { id: course_id }
  })

  const prerequisites = useQuery(COURSE_PREREQUISITE_COURSES, {
    variables: { id: course_id }
  })

  const toggleConcept = (id) => () => {
    const alreadyActive = activeConceptIds.find(i => i === id)
    setActiveConceptIds(alreadyActive ?
      activeConceptIds.filter(conceptId => conceptId !== id) :
      activeConceptIds.concat(id)
    )
  }

  const resetConceptToggle = () => {
    setActiveConceptIds([])
  }

  return (
    <React.Fragment>
      {
        course.data.courseById && prerequisites.data.courseById ?
          <Grid container spacing={0} direction="row">

            <CourseTray
              activeCourse={course_id}
              course_id={course.data.courseById.id}
              prerequisiteCourses={prerequisites.data.courseById.prerequisiteCourses}
              setCourseTrayOpen={setCourseTrayOpen}
              courseTrayOpen={courseTrayOpen}
              createCourse={createCourse}
            />
            <CourseContainer
              courses={prerequisites.data.courseById.prerequisiteCourses}
              course_id={course_id}
              activeConceptIds={activeConceptIds}
              updateCourse={updateCourse}
              courseTrayOpen={courseTrayOpen}
            />
            <ActiveCourse
              course={course.data.courseById}
              activeConceptIds={activeConceptIds}
              toggleConcept={toggleConcept}
              resetConceptToggle={resetConceptToggle}
              courseTrayOpen={courseTrayOpen}
            />
          </Grid> :
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

export default CourseView