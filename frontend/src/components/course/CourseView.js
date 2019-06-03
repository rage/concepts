import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'

import { useQuery, useMutation } from 'react-apollo-hooks'


import {
  FETCH_COURSE,
  ADD_COURSE_AS_PREREQUISITE,
  COURSE_PREREQUISITE_COURSES
} from '../../services/CourseService'

import CourseContainer from './CourseContainer'
import MaterialCourseTray from './MaterialCourseTray'
import MaterialActiveCourse from './MaterialActiveCourse'

const CourseView = ({ course_id, createCourse, updateCourse, courses }) => {
  const [activeConceptIds, setActiveConceptIds] = useState([])

  const course = useQuery(FETCH_COURSE, {
    variables: { id: course_id }
  })

  const prerequisites = useQuery(COURSE_PREREQUISITE_COURSES, {
    variables: { id: course_id }
  })

  const addCourseAsPrerequisite = useMutation(ADD_COURSE_AS_PREREQUISITE, {
    refetchQueries: [{
      query: COURSE_PREREQUISITE_COURSES,
      variables: { id: course_id }
    }]
  })

  const toggleConcept = (id) => () => {
    const alreadyActive = activeConceptIds.find(i => i === id)
    setActiveConceptIds(alreadyActive ? 
      activeConceptIds.filter(conceptId => conceptId !== id) : 
      activeConceptIds.concat(id)
      )
  }

  return (
    <React.Fragment>
      {
        course.data.courseById && prerequisites.data.courseById ?
          <Grid container spacing={0} direction="row">

            <MaterialCourseTray
              activeCourse={course_id}
              addCourseAsPrerequisite={addCourseAsPrerequisite}
              prerequisiteCourses={prerequisites.data.courseById.prerequisiteCourses.filter(course =>
                course.id !== course_id
              )}
              createCourse={createCourse}
            />
            <CourseContainer
              courses={prerequisites.data.courseById.prerequisiteCourses.filter(course =>
                course.id !== course_id
              )}
              course_id={course_id}
              activeConceptIds={activeConceptIds}
              updateCourse={updateCourse}
            />
            <MaterialActiveCourse
              course={course.data.courseById}
              activeConceptIds={activeConceptIds}
              toggleConcept={toggleConcept}
            />
          </Grid> :
          null
      }
    </React.Fragment>
  )
}

export default CourseView