import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Course from './Course'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'

import IconButton from '@material-ui/core/IconButton'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'

import Masonry from './Masonry'

import { useLoginStateValue } from '../../store'

import useCreateConceptDialog from './useCreateConceptDialog'
import useEditConceptDialog from './useEditConceptDialog'
import useEditCourseDialog from './useEditCourseDialog'

const useStyles = makeStyles(theme => ({
  snackbar: {
    margin: theme.spacing(4)
  },
  info: {
    backgroundColor: theme.palette.primary.dark
  },
  infoIcon: {
    marginRight: theme.spacing(1)
  },
  icon: {
    fontSize: 20
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}))

const CONCEPT_ADDING_INSTRUCTION = (
  'Add concept as a learning objective in the left column.'
)
const COURSE_ADDING_INSTRUCTION = (
  'To add prerequisites, open the drawer on the right.'
)
const CONCEPT_LINKING_INSTRUCTION = (
  'Switch on a learning objective on the left to start linking prerequisites.'
)

const GuidedCourseContainer = ({
  courseTrayOpen,
  setCourseTrayOpen,
  activeCourse,
  courses,
  activeConceptIds,
  addingLink,
  setAddingLink,
  workspaceId,
  courseId
}) => {
  const classes = useStyles()

  const [conceptInfoState, setConceptInfoState] = useState(false)
  const [courseInfoState, setCourseInfoState] = useState(false)
  const [linkInfoState, setLinkInfoState] = useState(false)

  const { loggedIn } = useLoginStateValue()[0]

  const {
    openCreateConceptDialog,
    ConceptCreateDialog
  } = useCreateConceptDialog(activeCourse, workspaceId)

  const {
    openEditConceptDialog,
    ConceptEditDialog
  } = useEditConceptDialog(activeCourse, workspaceId)

  const { openEditCourseDialog,
    CourseEditDialog
  } = useEditCourseDialog(workspaceId)

  useEffect(() => {
    if (activeCourse.concepts.length === 0) {
      setConceptInfoState(true)
      setCourseInfoState(false)
      setCourseTrayOpen(false)
      setLinkInfoState(false)
    } else if (courses.length === 0) {
      setConceptInfoState(false)
      setLinkInfoState(false)
      setCourseInfoState(true)
    } else if (courses.length > 0) {
      setLinkInfoState(true)
      setConceptInfoState(false)
      setCourseInfoState(false)
    } else {
      setConceptInfoState(false)
      setCourseInfoState(false)
    }
  }, [activeCourse.concepts.length, courses.length, setCourseTrayOpen])

  const handleConceptInfoClose = () => {
    setConceptInfoState(false)
  }

  const handleCourseInfoClose = () => {
    setCourseInfoState(false)
  }

  const handleLinkInfoClose = () => {
    setLinkInfoState(false)
  }

  return <>
    <Typography style={{ gridArea: 'contentHeader', margin: '16px' }} variant='h4'>
      Prerequisites
    </Typography>
    {
      courses && courses.length !== 0 ?
        <div onClick={() => setAddingLink(null)} style={{ gridArea: 'courses', overflowY: 'auto' }}>
          {courses && <Masonry courseTrayOpen={courseTrayOpen}>
            {courses.map(course =>
              <Course
                key={course.id}
                course={course}
                activeConceptIds={activeConceptIds}
                addingLink={addingLink}
                setAddingLink={setAddingLink}
                openCourseDialog={openEditCourseDialog}
                openConceptDialog={openCreateConceptDialog}
                openConceptEditDialog={openEditConceptDialog}
                activeCourseId={courseId}
                workspaceId={workspaceId}
              />
            )}
          </Masonry>}
        </div>
        :
        null
    }

    {/* Dialogs */}

    {CourseEditDialog}
    {ConceptCreateDialog}
    {ConceptEditDialog}

    {/* Intruction snackbars */}
    {loggedIn ?
      <React.Fragment>
        <Snackbar open={conceptInfoState}
          onClose={handleConceptInfoClose}
          className={classes.snackbar}
          ClickAwayListenerProps={{ onClickAway: () => null }}
          ContentProps={{
            'aria-describedby': 'message-id'
          }}
        >
          <SnackbarContent className={classes.info}
            action={[
              <IconButton
                key='close'
                aria-label='Close'
                color='inherit'
                onClick={handleConceptInfoClose}
              >
                <CloseIcon className={classes.icon} />
              </IconButton>
            ]}
            message={
              <span className={classes.message} id='message-id'>
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
            'aria-describedby': 'message-id'
          }}
        >
          <SnackbarContent className={classes.info}
            action={[
              <IconButton
                key='close'
                aria-label='Close'
                color='inherit'
                onClick={handleCourseInfoClose}
              >
                <CloseIcon className={classes.icon} />
              </IconButton>
            ]}
            message={
              <span className={classes.message} id='message-id'>
                <InfoIcon className={classes.infoIcon} />
                {COURSE_ADDING_INSTRUCTION}
              </span>}
          />
        </Snackbar>
        <Snackbar open={linkInfoState}
          onClose={handleLinkInfoClose}
          ClickAwayListenerProps={{ onClickAway: () => null }}
          autoHideDuration={6000}
          className={classes.snackbar}
          ContentProps={{
            'aria-describedby': 'message-id'
          }}
        >
          <SnackbarContent className={classes.info}
            action={[
              <IconButton
                key='close'
                aria-label='Close'
                color='inherit'
                onClick={handleLinkInfoClose}
              >
                <CloseIcon className={classes.icon} />
              </IconButton>
            ]}
            message={
              <span className={classes.message} id='message-id'>
                <InfoIcon className={classes.infoIcon} />
                {CONCEPT_LINKING_INSTRUCTION}
              </span>}
          />
        </Snackbar>
      </React.Fragment>
      : null
    }
  </>
}

export default GuidedCourseContainer
