import React, { useRef, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Paper, Select, MenuItem, InputBase, List, IconButton } from '@material-ui/core'
import { Edit as EditIcon } from '@material-ui/icons'

import { DELETE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_BY_ID } from '../../graphql/Query'
import ActiveConcept from '../concept/ActiveConcept'
import useCreateConceptDialog from './useCreateConceptDialog'
import useEditConceptDialog from './useEditConceptDialog'
import useEditCourseDialog from './useEditCourseDialog'
import { useLoginStateValue } from '../../store'
import { useInfoBox } from '../common/InfoBox'

const useStyles = makeStyles(theme => ({
  root: {
    gridArea: 'activeCourse',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box'
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
  activeConceptIds,
  onClick,
  addingLink,
  setAddingLink,
  toggleConcept,
  courseLinks,
  urlPrefix
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const { loggedIn } = useLoginStateValue()[0]

  useEffect(() => {
    const hasLinks = course.concepts.find(concept => concept.linksToConcept.length > 0)
    const prereqConceptExists = courseLinks.find(link => link.from.concepts.length > 0)
    if (hasLinks && activeConceptIds.length === 0) {
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

  const {
    openCreateConceptDialog,
    ConceptCreateDialog
  } = useCreateConceptDialog(course, workspaceId, false)

  const {
    openEditConceptDialog,
    ConceptEditDialog
  } = useEditConceptDialog(course, workspaceId)

  const { openEditCourseDialog,
    CourseEditDialog
  } = useEditCourseDialog(workspaceId)

  const client = useApolloClient()

  const createButtonRef = useRef()
  const conceptLinkRef = useRef()
  const activeConceptRef = useRef()


  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({
        query: COURSE_BY_ID,
        variables: {
          id: course.id
        }
      })

      const deletedConcept = response.data.deleteConcept
      const dataInStoreCopy = { ...dataInStore }
      const concepts = dataInStoreCopy.courseById.concepts
      if (includedIn(concepts, deletedConcept)) {
        dataInStoreCopy.courseById.concepts = concepts.filter(c => c.id !== deletedConcept.id)
        client.writeQuery({
          query: COURSE_BY_ID,
          variables: { id: course.id },
          data: dataInStoreCopy
        })
      }
    }
  })

  return <>
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
          <IconButton onClick={openEditCourseDialog(course.id, course.name)}>
            <EditIcon />
          </IconButton>
        </div>
      </div>

      <List className={classes.list}>
        {course.concepts.map((concept, index) =>
          <ActiveConcept
            conceptLinkRef={index === 0 ? conceptLinkRef : undefined}
            activeConceptRef={index === 0 ? activeConceptRef : undefined}
            concept={concept}
            key={concept.id}
            activeConceptIds={activeConceptIds}
            addingLink={addingLink}
            setAddingLink={setAddingLink}
            deleteConcept={deleteConcept}
            openConceptEditDialog={openEditConceptDialog}
            toggleConcept={toggleConcept}
            workspaceId={workspaceId}
          />
        )}
      </List>

      {loggedIn ?
        <Button
          className={classes.button}
          onClick={openCreateConceptDialog(course.id)}
          variant='contained'
          color='secondary'
          ref={createButtonRef}
        >
          Add concept
        </Button> : null
      }
    </Paper>

    {/* Dialogs */}

    {CourseEditDialog}
    {ConceptCreateDialog}
    {ConceptEditDialog}
  </>
}

export default withRouter(ActiveCourse)
