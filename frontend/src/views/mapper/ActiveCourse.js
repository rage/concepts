import React, { useRef, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button, Paper, Select, MenuItem, InputBase, List, IconButton, Typography
} from '@material-ui/core'
import { Edit as EditIcon } from '@material-ui/icons'

import { Concept } from './concept'
import { useCreateConceptDialog } from '../../dialogs/concept'
import { useEditCourseDialog } from '../../dialogs/course'
import { useLoginStateValue } from '../../store'
import { useInfoBox } from '../../components/InfoBox'

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
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto'
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
  const { loggedIn } = useLoginStateValue()[0]

  useEffect(() => {
    const hasLinks = course.concepts.find(concept => concept.linksToConcept.length > 0)
    const prereqConceptExists = courseLinks.find(link => link.from.concepts.length > 0)
    if (hasLinks && focusedConceptIds.length === 0) {
      infoBox.open(activeConceptRef.current, 'right-start', 'FOCUS_CONCEPT', 0, 50)
    }
    if (hasLinks) return
    if (course.concepts.length === 0) {
      infoBox.open(createButtonRef.current, 'right-start', 'CREATE_CONCEPT_TARGET', 0, 50)
    }
    if (!prereqConceptExists) return
    if (courseLinks.length > 0 && !addingLink) {
      infoBox.open(conceptLinkRef.current, 'right-start', 'DRAW_LINK_START', 0, 20)
    }
  }, [course.concepts, addingLink, courseLinks])

  const openCreateConceptDialog = useCreateConceptDialog(workspaceId)
  const openEditCourseDialog = useEditCourseDialog(workspaceId)

  const createButtonRef = useRef()
  const conceptLinkRef = useRef()
  const activeConceptRef = useRef()

  return <>
    <Typography style={{ gridArea: 'activeHeader', margin: '8px 16px 16px' }} variant='h4'>
      Editing course
    </Typography>
    <Paper onClick={onClick} elevation={0} className={classes.root}>
      <div className={classes.header}>
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
          <IconButton onClick={() => openEditCourseDialog(course.id, course.name)}>
            <EditIcon />
          </IconButton>
        </div>
      </div>

      <List className={classes.list}>
        {course.concepts.map((concept, index) =>
          <Concept
            conceptLinkRef={index === 0 ? conceptLinkRef : undefined}
            activeConceptRef={index === 0 ? activeConceptRef : undefined}
            isActive={true}
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
