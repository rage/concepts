import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grid from '@material-ui/core/Grid'

// Card
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

import { COURSE_BY_ID } from '../../graphql/Query'

import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { UPDATE_CONCEPT, CREATE_CONCEPT, DELETE_CONCEPT } from '../../graphql/Mutation'

// List
import List from '@material-ui/core/List'


import ActiveConcept from '../concept/ActiveConcept'

import ConceptEditingDialog from '../concept/ConceptEditingDialog'
import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'

import { useLoginStateValue } from '../../store'


const styles = theme => ({
  root: {
    height: '90vh'
  },
  list: {
    width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    // paddingBottom: theme.spacing.unit * 2,
    // position: 'relative',
    overflow: 'auto',
    maxHeight: '73vh',
    padding: 0
  },
  cardHeader: {
    marginTop: '5px',
    paddingBottom: '0px',
    textAlign: 'center'
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
    width: '100%'
  }
})

const ActiveCourse = ({
  classes, // UI
  course,
  workspaceId,
  activeConceptIds,
  conceptCircleRef,
  toggleConcept,
  resetConceptToggle
}) => {

  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({ open: false, id: '', name: '', description: '' })

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
        dataInStoreCopy.courseById.concepts = concepts.map(c => c.id === updatedConcept.id ? updatedConcept : c)
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

  const handleClickAway = (event) => {
    try {
      const isConceptButton = event.composedPath()
        .map(el => el.id)
        .find(id => (id + '').substring(0, 7) === 'concept')
      if (!isConceptButton) {
        resetConceptToggle()
      }
    }
    catch (err) { console.log('Unsuccessful clickaway') }
  }

  const handleConceptClose = () => {
    setConceptState({ ...conceptState, open: false })
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


  return (
    <Grid item xs={4} lg={3}>
      <Card elevation={0} className={classes.root}>
        <CardHeader className={classes.cardHeader} title={course.name} titleTypographyProps={{ variant: 'h4' }}>
        </CardHeader>

        <CardContent>
          <ClickAwayListener onClickAway={handleClickAway}>
            <List className={classes.list}>
              {course.concepts.map(concept =>
                <ActiveConcept concept={concept}
                  key={concept.id}
                  activeConceptIds={activeConceptIds}
                  conceptCircleRef={conceptCircleRef}
                  deleteConcept={deleteConcept}
                  openConceptDialog={handleConceptOpen}
                  openConceptEditDialog={handleConceptEditOpen}
                  toggleConcept={toggleConcept}
                />
              )}
            </List>
          </ClickAwayListener>

          {loggedIn ?
            <Button
              className={classes.button}
              onClick={handleConceptOpen(course.id)}
              variant="contained"
              color="secondary"
            >
              Add concept
            </Button> : null
          }

        </CardContent>
      </Card>

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
    </Grid>
  )
}

export default withStyles(styles)(ActiveCourse)
