import React, { useRef, useEffect } from 'react'
import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'

import { Button, Paper, Typography, List, IconButton } from '@material-ui/core'
import { Edit as EditIcon } from '@material-ui/icons'

import { DELETE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_BY_ID } from '../../graphql/Query'

import ActiveConcept from '../concept/ActiveConcept'

import useCreateConceptDialog from './useCreateConceptDialog'
import useEditConceptDialog from './useEditConceptDialog'
import useEditCourseDialog from './useEditCourseDialog'

import { useLoginStateValue } from '../../store'

import { useFocusOverlay } from '../common/FocusOverlay'
import { useInfoBox } from '../common/InfoBox'


const useStyles = makeStyles(theme => ({
  root: {
    gridArea: 'activeCourse',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box'
  },
  title: {
    paddingBottom: '0px',
    maxWidth: '100%',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    marginBottom: '16px'
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
  workspaceId,
  activeConceptIds,
  addingLink,
  setAddingLink,
  toggleConcept
}) => {
  const classes = useStyles()
  const overlay = useFocusOverlay()
  const infoBox = useInfoBox()
  const { loggedIn } = useLoginStateValue()[0]

  useEffect(() => {
    if (course.concepts.length === 0) {
      overlay.open(createButtonRef.current)
      infoBox.open(createButtonRef.current, 'right-start', 'HMM', '...', 0, 50)
    }
  }, [course.concepts.length])

  const {
    openCreateConceptDialog,
    ConceptCreateDialog
  } = useCreateConceptDialog(course, workspaceId)

  const {
    openEditConceptDialog,
    ConceptEditDialog
  } = useEditConceptDialog(course, workspaceId)

  const { openEditCourseDialog,
    CourseEditDialog
  } = useEditCourseDialog(workspaceId)

  const client = useApolloClient()

  const createButtonRef = useRef()


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
    <Paper elevation={0} className={classes.root}>
      <div
        className={'activeCourseHeaderContent'}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <div style={{ flex: '1 1 auto' }}>
          <Typography className={classes.title} variant='h4'>
            {course.name}
          </Typography>
        </div>
        <div
          style={{
            flex: '0 0 auto',
            alignSelf: 'flex-start',
            marginTop: '-8px',
            marginRight: '-8px'
          }}
        >
          <IconButton onClick={openEditCourseDialog(course.id, course.name)}>
            <EditIcon />
          </IconButton>
        </div>
      </div>

      <List className={classes.list}>
        {course.concepts.map(concept =>
          <ActiveConcept concept={concept}
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

export default ActiveCourse
