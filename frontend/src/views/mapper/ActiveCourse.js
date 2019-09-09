import React, { useRef, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button, Paper, Select, MenuItem, InputBase, List, IconButton
} from '@material-ui/core'
import { Edit as EditIcon, Lock as LockIcon } from '@material-ui/icons'

import { Concept } from './concept'
import { useCreateConceptDialog } from '../../dialogs/concept'
import { useEditCourseDialog } from '../../dialogs/course'
import { useLoginStateValue } from '../../store'
import { useInfoBox } from '../../components/InfoBox'
import DividerWithText from '../../components/DividerWithText'

const useStyles = makeStyles(theme => ({
  root: {
    gridArea: 'activeCourse',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box',
    margin: '0 8px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    maxWidth: 'calc(100% - 48px)',
    overflowWrap: 'break-word',
    hyphens: 'auto'
  },
  titleSelect: {
    fontSize: '1.4rem',
    fontWeight: 'bold'
  },
  titleEditWrapper: {
    flex: '0 0 auto',
    alignSelf: 'flex-start',
    marginRight: '-8px'
  },
  list: {
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
    flex: 1
  },
  listSection: {
    backgroundColor: 'inherit'
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0
  },
  highlight: {
    backgroundColor: 'cyan'
  },
  button: {
    marginTop: '16px',
    width: '100%'
  }
}))

const ActiveCourse = ({
  course,
  courses,
  history,
  workspaceId,
  focusedConceptIds,
  onClick,
  addingLink,
  setAddingLink,
  toggleFocus,
  courseLinks,
  urlPrefix
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const { user, loggedIn } = useLoginStateValue()[0]

  useEffect(() => {
    const hasLinks = course.concepts.find(concept => concept.linksToConcept.length > 0)
    if (hasLinks && focusedConceptIds.length === 0) {
      infoBox.open(activeConceptRef.current, 'left-start', 'FOCUS_CONCEPT', 0, 50)
    }
    if (hasLinks) return
    if (course.concepts.length === 0) {
      infoBox.open(createButtonRef.current, 'left-end', 'CREATE_CONCEPT_TARGET', 0, 50)
    }
    if (addingLink) {
      infoBox.open(conceptLinkRef.current, 'left-start', 'DRAW_LINK_END', 0, 20)
    }
  }, [addingLink, courseLinks])

  const openCreateConceptDialog = useCreateConceptDialog(workspaceId, user.role === 'STAFF')
  const openEditCourseDialog = useEditCourseDialog(workspaceId, user.role === 'STAFF')

  const createButtonRef = useRef()
  const conceptLinkRef = useRef()
  const activeConceptRef = useRef()

  return <>
    <DividerWithText
      content='Editing course'
      gridArea='activeHeader'
      margin='0px 8px 0px 8px'
    />
    <Paper onClick={onClick} elevation={0} className={classes.root}>
      <div title={course.name} className={classes.header}>
        <Select
          value={course.id}
          classes={{ root: classes.titleSelect }}
          input={<InputBase classes={{ root: classes.title }} />}
          onChange={evt => history.push(`${urlPrefix}/${workspaceId}/mapper/${evt.target.value}`)}
        >
          {courses ? courses.map(course => (
            <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
          )) : <MenuItem value={course.id}>{course.name}</MenuItem>}
        </Select>
        <div className={classes.titleEditWrapper}>
          {
            (!course.frozen || user.role === 'STAFF') ?
              <IconButton onClick={() =>
                openEditCourseDialog(course.id, course.name, course.official, course.frozen)}>
                <EditIcon />
              </IconButton>
              :
              <IconButton disabled>
                <LockIcon />
              </IconButton>
          }
        </div>
      </div>

      <List className={classes.list}>
        {course.concepts.map((concept, index) =>
          <Concept
            conceptLinkRef={index === 0 ? conceptLinkRef : undefined}
            activeConceptRef={index === 0 ? activeConceptRef : undefined}
            isActive
            concept={concept}
            key={concept.id}
            focusedConceptIds={focusedConceptIds}
            addingLink={addingLink}
            setAddingLink={setAddingLink}
            toggleFocus={toggleFocus}
            activeCourseId={course.id}
            workspaceId={workspaceId}
          />
        )}
      </List>

      {loggedIn ?
        <Button
          className={classes.button}
          onClick={() => openCreateConceptDialog(course.id)}
          variant='contained'
          color='secondary'
          ref={createButtonRef}
        >
          Add concept
        </Button> : null
      }
    </Paper>
  </>
}

export default withRouter(ActiveCourse)
