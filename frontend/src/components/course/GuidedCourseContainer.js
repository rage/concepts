import React, { useState, useEffect } from 'react'
import { withStyles } from "@material-ui/core/styles";
import Course from './Course'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { ALL_COURSES } from '../../services/CourseService'
import { UPDATE_CONCEPT, CREATE_CONCEPT } from '../../services/ConceptService'
import { COURSE_PREREQUISITE_COURSES } from '../../services/CourseService'

import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'
import ConceptEditingDialog from '../concept/ConceptEditingDialog'
import CourseEditingDialog from './CourseEditingDialog'

import IconButton from '@material-ui/core/IconButton'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'

import Masonry from 'react-masonry-css'
import '../../MasonryLayout.css'

const breakpointColumnsObj = {
  default: 3,
  1900: 2,
  1279: 1
}

const styles = theme => ({
  snackbar: {
    margin: theme.spacing.unit * 4
  },
  info: {
    backgroundColor: theme.palette.primary.dark
  },
  infoIcon: {
    marginRight: theme.spacing.unit
  },
  icon: {
    fontSize: 20
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
})

const CONCEPT_ADDING_INSTRUCTION = "Add concept as a learning objective from left column."
const COURSE_ADDING_INSTRUCTION = "Add courses from the right column"
// const CONCEPT_LINKING_INSTRUCTION = "TBA"

const GuidedCourseContainer = ({ classes, setCourseTrayOpen, activeCourse, courses, courseTrayOpen, activeConceptIds, updateCourse, course_id }) => {
  const [courseState, setCourseState] = useState({ open: false, id: '', name: '' })
  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({ open: false, id: '', name: '', description: '' })

  const [conceptInfoState, setConceptInfoState] = useState(false)
  const [courseInfoState, setCourseInfoState] = useState(false)

  useEffect(() => {
    if (activeCourse.concepts.length === 0) {
      setConceptInfoState(true)
      setCourseInfoState(false)
      setCourseTrayOpen(false)
    } else if (courses.length === 0) {
      setConceptInfoState(false)
      setCourseInfoState(true)
    } else {
      setConceptInfoState(false)
      setCourseInfoState(false)
    }
  }, [activeCourse.concepts.length, courses.length, setCourseTrayOpen])

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
    setCourseState({ open: false, id: '', name: '' })
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
      <Grid item key={course.id}>
        <Course
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

  const handleConceptInfoClose = () => {
    setConceptInfoState(false)
  };

  const handleCourseInfoClose = () => {
    setCourseInfoState(false)
  }

  return (
    <React.Fragment>
      <Grid container item xs={courseTrayOpen ? 4 : 8} lg={courseTrayOpen ? 6 : 9}>
        <Grid item>
          <Typography style={{ margin: '2px 0px 0px 10px' }} variant='h4'>Prerequisites</Typography>
        </Grid>
        {
          courses && courses.length !== 0 ?
            <Grid container item>
              <div style={{ overflowY: 'scroll', width: '100%', height: '85vh', paddingTop: '14px', display: 'flex', justifyContent: 'center' }}>
                {
                  courses && courses.length < 3 ?
                    <Grid container justify='space-evenly'>
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
                          <Course
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
            </Grid>
            :
            null
        }
      </Grid>
      <CourseEditingDialog
        state={courseState}
        handleClose={handleCourseClose}
        updateCourse={updateCourse}
        defaultName={courseState.name}
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
        defaultDescription={conceptEditState.description}
        defaultName={conceptEditState.name}
      />
      <Snackbar open={conceptInfoState}
        onClose={handleConceptInfoClose}
        className={classes.snackbar}
        ClickAwayListenerProps={{ onClickAway: () => null }}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}>
        <SnackbarContent className={classes.info}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={handleConceptInfoClose}
            >
              <CloseIcon className={classes.icon} />
            </IconButton>
          ]}
          message={
            <span className={classes.message} id="message-id">
              <InfoIcon className={classes.infoIcon} />
              {CONCEPT_ADDING_INSTRUCTION}
            </span>}
        />
      </Snackbar>
      <Snackbar open={courseInfoState}
        onClose={handleCourseInfoClose}
        ClickAwayListenerProps={{ onClickAway: () => null }}
        className={classes.snackbar}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        >

        <SnackbarContent className={classes.info}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={handleCourseInfoClose}
            >
              <CloseIcon className={classes.icon} />
            </IconButton>
          ]}
          message={
            <span className={classes.message} id="message-id">
              <InfoIcon className={classes.infoIcon} />
              {COURSE_ADDING_INSTRUCTION}
            </span>}
        />
      </Snackbar>
    </React.Fragment>
  )
}

export default withStyles(styles)(GuidedCourseContainer)