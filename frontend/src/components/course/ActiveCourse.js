import React, { useState } from 'react'
import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { withStyles } from '@material-ui/core/styles'

import { Button, Grid, Paper, Typography, List } from '@material-ui/core'

import { UPDATE_CONCEPT, CREATE_CONCEPT, DELETE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_BY_ID } from '../../graphql/Query'

import ActiveConcept from '../concept/ActiveConcept'

import ConceptEditingDialog from '../concept/ConceptEditingDialog'
import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'

import { useLoginStateValue } from '../../store'


const styles = theme => ({
  root: {
    gridArea: 'activeCourse',
    height: '100%',
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
})

const ActiveCourse = ({
  classes, // UI
  onClick,
  course,
  workspaceId,
  activeConceptIds,
  addingLink,
  setAddingLink,
  toggleConcept
}) => {
  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({
    open: false,
    id: '',
    name: '',
    description: ''
  })

  const { loggedIn } = useLoginStateValue()[0]

  const client = useApolloClient()

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({
        query: COURSE_BY_ID,
        variables: {
          id: course.id
        }
      })
      const updatedConcept = response.data.updateConcept
      const dataInStoreCopy = { ...dataInStore }
      const concepts = dataInStoreCopy.courseById.concepts
      if (includedIn(concepts, updatedConcept)) {
        dataInStoreCopy.courseById.concepts = concepts.map(c =>
          c.id === updatedConcept.id ? updatedConcept : c
        )
        client.writeQuery({
          query: COURSE_BY_ID,
          variables: { id: course.id },
          data: dataInStoreCopy
        })
      }
    }
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({
        query: COURSE_BY_ID,
        variables: {
          id: course.id
        }
      })
      const addedConcept = response.data.createConcept
      const dataInStoreCopy = { ...dataInStore }
      const concepts = dataInStoreCopy.courseById.concepts
      if (!includedIn(concepts, addedConcept)) {
        dataInStoreCopy.courseById.concepts.push(addedConcept)
        client.writeQuery({
          query: COURSE_BY_ID,
          variables: {
            id: course.id
          },
          data: dataInStoreCopy
        })
      }
    }
  })

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

  const handleConceptClose = () => {
    setConceptState({ ...conceptState, open: false, id: '' })
  }

  const handleConceptOpen = (courseId) => () => {
    setConceptState({ open: true, id: courseId })
  }

  const handleConceptEditClose = () => {
    setConceptEditState({ open: false, id: '', name: '', description: '' })
  }

  const handleConceptEditOpen = (id, name, description) => () => {
    setConceptEditState({ open: true, id, name, description })
  }


  return <>
    <Paper elevation={0} className={classes.root}>
      <Typography className={classes.title} variant='h4'>
        {course.name}
      </Typography>

      <List className={classes.list}>
        {course.concepts.map(concept =>
          <ActiveConcept concept={concept}
            key={concept.id}
            activeConceptIds={activeConceptIds}
            addingLink={addingLink}
            setAddingLink={setAddingLink}
            deleteConcept={deleteConcept}
            openConceptDialog={handleConceptOpen}
            openConceptEditDialog={handleConceptEditOpen}
            toggleConcept={toggleConcept}
            workspaceId={workspaceId}
          />
        )}
      </List>

      {loggedIn ?
        <Button
          className={classes.button}
          onClick={handleConceptOpen(course.id)}
          variant='contained'
          color='secondary'
        >
          Add concept
        </Button> : null
      }
    </Paper>

    <ConceptEditingDialog
      state={conceptEditState}
      handleClose={handleConceptEditClose}
      updateConcept={updateConcept}
      workspaceId={workspaceId}
      defaultName={conceptEditState.name}
      defaultDescription={conceptEditState.description}
    />
    <ConceptAdditionDialog
      state={conceptState}
      handleClose={handleConceptClose}
      createConcept={createConcept}
      workspaceId={workspaceId}
    />
  </>
}

export default withStyles(styles)(ActiveCourse)
