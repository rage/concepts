import React, { useState } from 'react'
import MaterialCourse from './MaterialCourse'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { ALL_COURSES } from '../../services/CourseService'
import { UPDATE_CONCEPT, CREATE_CONCEPT } from '../../services/ConceptService'
import { COURSE_PREREQUISITE_COURSES } from '../../services/CourseService'

import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'
import ConceptEditingDialog from '../concept/ConceptEditingDialog'
import CourseEditingDialog from './CourseEditingDialog'

import Masonry from 'react-masonry-css'
import '../../MasonryLayout.css'

const breakpointColumnsObj = {
  default: 3,
  1900: 2,
  1279: 1
}

const CourseContainer = ({ courses, activeConceptIds, updateCourse, course_id }) => {
  const [courseState, setCourseState] = useState({ open: false, id: '', name: '' })
  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({ open: false, id: '', name: '', description: '' })

  const client = useApolloClient()

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES, variables: { id: course_id } })
      const addedConcept = response.data.createConcept
      const dataInStoreCopy = { ...dataInStore }
      const course = dataInStoreCopy.courseById.prerequisiteCourses.find(c => c.id === conceptState.id)

      if (!includedIn(course.concepts, addedConcept)) {
        course.concepts.push(addedConcept)
        client.writeQuery({
          query: COURSE_PREREQUISITE_COURSES,
          variables: { id: course_id },
          data: dataInStoreCopy
        })
      }
      setConceptState({ ...conceptState, id: '' })
    }
  })

  const handleCourseClose = () => {
    setCourseState({ open: false, id: '' })
  }

  const handleCourseOpen = (id, name) => () => {
    setCourseState({ open: true, id, name })
  }

  const handleConceptClose = () => {
    setConceptState({ ...conceptState, open: false })
  }

  const handleConceptOpen = (id) => () => {
    setConceptState({ open: true, id })
  }

  const handleConceptEditClose = () => {
    setConceptEditState({ open: false, id: '', name: '', description: '' })
  }

  const handleConceptEditOpen = (id, name, description) => () => {
    setConceptEditState({ open: true, id, name, description })
  }

  const makeGridCourseElements = () => {
    return courses && courses.map(course =>
      <Grid item>
        <MaterialCourse
          key={course.id}
          course={course}
          activeConceptIds={activeConceptIds}
          openCourseDialog={handleCourseOpen}
          openConceptDialog={handleConceptOpen}
          openConceptEditDialog={handleConceptEditOpen}
          activeCourseId={course_id}
        />
      </Grid>
    )
  }

  return (
    <React.Fragment>
      {
        courses && courses.length !== 0 ?
          <Grid container item xs={4} lg={6}>
            <div style={{ overflowY: 'scroll', width: '100%', maxHeight: '90vh', display: 'flex', justifyContent: 'center' }}>
              {
                courses && courses.length < 3 ?
                  <Grid container direction='rows' justify='space-evenly'>
                    {
                      makeGridCourseElements()
                    }
                  </Grid>
                  :
                  <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                  >
                    {
                      courses && courses.map(course =>
                        <MaterialCourse
                          key={course.id}
                          course={course}
                          activeConceptIds={activeConceptIds}
                          openCourseDialog={handleCourseOpen}
                          openConceptDialog={handleConceptOpen}
                          openConceptEditDialog={handleConceptEditOpen}
                          activeCourseId={course_id}
                        />
                      )
                    }
                  </Masonry>
              }

            </div>

            <CourseEditingDialog
              state={courseState}
              handleClose={handleCourseClose}
              updateCourse={updateCourse}
            />
            <ConceptAdditionDialog
              state={conceptState}
              handleClose={handleConceptClose}
              createConcept={createConcept}
            />
            <ConceptEditingDialog
              state={conceptEditState}
              handleClose={handleConceptEditClose}
              updateConcept={updateConcept}
            />
          </Grid>
          :
          <Grid container alignItems="center" justify="center" xs={4} lg={6}>
            <Grid item xs={4}>
              <Typography id="instructions" variant='body1'>
                Hello, here you can add courses as prerequisites by clicking the items in the leftmost column.
              </Typography>
              <br />
              <Typography id="instructions" variant='body1'>
                Activate selection of prerequisites for a concept of the current course by toggling a concept on
                the right.
              </Typography>
              <br />
              <Typography id="instructions" variant='body1'>
                When a concept is toggled, concepts of courses in the center can be linked to it by clicking them.
              </Typography>
            </Grid>
          </Grid>
      }
    </React.Fragment>
  )
}

export default CourseContainer