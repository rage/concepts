import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grid from '@material-ui/core/Grid';

// Card
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'


import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { ALL_COURSES, FETCH_COURSE } from '../../services/CourseService'
import { UPDATE_CONCEPT, CREATE_CONCEPT, DELETE_CONCEPT } from '../../services/ConceptService'

// List 
import List from '@material-ui/core/List'


import MaterialActiveConcept from '../concept/MaterialActiveConcept'

import ConceptEditingDialog from '../concept/ConceptEditingDialog'
import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'


const styles = theme => ({
  root: {
    height: '90vh',
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
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  highlight: {
    backgroundColor: 'cyan'
  },
  button: {
    width: '100%'
  }
});

const MaterialActiveCourse = ({
  classes, // MaterialUI
  course,
  activateConcept,
  activeConceptId
}) => {

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
      const dataInStore = store.readQuery({ query: FETCH_COURSE, variables: { id: course.id } })
      const addedConcept = response.data.createConcept
      const dataInStoreCopy = { ...dataInStore }
      const concepts = dataInStoreCopy.courseById.concepts
      if (!includedIn(concepts, addedConcept)) {
        concepts.push(addedConcept)
        client.writeQuery({
          query: FETCH_COURSE,
          variables: { id: course.id },
          data: dataInStoreCopy
        })
      }
      setConceptState({ ...conceptState, id: '' })
    }
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: FETCH_COURSE, variables: { id: course.id } })
      const deletedConcept = response.data.deleteConcept
      const dataInStoreCopy = { ...dataInStore }
      let concepts = dataInStoreCopy.courseById.concepts
      if (includedIn(concepts, deletedConcept)) {
        dataInStoreCopy.courseById.concepts = concepts.filter(c => c.id !== deletedConcept.id)
        client.writeQuery({
          query: FETCH_COURSE,
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
        activateConcept('')()
      }
    }
    catch (err) { console.log('Unsuccessful clickaway') }
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


  return (
    <Grid item xs={4} lg={3}>
      <Card elevation={0} className={classes.root}>
        <CardHeader className={classes.cardHeader} title={course.name} titleTypographyProps={{ variant: 'h4' }}>
        </CardHeader>

        <CardContent>
          <ClickAwayListener onClickAway={handleClickAway}>
            <List className={classes.list}>
              {course.concepts.map(concept =>
                <MaterialActiveConcept concept={concept}
                  key={concept.id}
                  activateConcept={activateConcept}
                  activeConceptId={activeConceptId}
                  deleteConcept={deleteConcept}
                  openConceptDialog={handleConceptOpen}
                  openConceptEditDialog={handleConceptEditOpen}
                />
              )}
            </List>
          </ClickAwayListener>

          <Button
            className={classes.button}
            onClick={handleConceptOpen(course.id)}
            variant="contained"
            color="secondary"
          >
            Add concept
          </Button>
        </CardContent>
      </Card>

      <ConceptEditingDialog state={conceptEditState} handleClose={handleConceptEditClose} updateConcept={updateConcept} />
      <ConceptAdditionDialog state={conceptState} handleClose={handleConceptClose} createConcept={createConcept} />
    </Grid>
  )
}

export default withStyles(styles)(MaterialActiveCourse)