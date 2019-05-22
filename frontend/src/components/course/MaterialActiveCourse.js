import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

// Card
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

// Dialog
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';


import { useMutation } from 'react-apollo-hooks'
import { ALL_COURSES, UPDATE_COURSE } from '../../services/CourseService'
import { UPDATE_CONCEPT } from '../../services/ConceptService'

// List 
import List from '@material-ui/core/List';

// Icons
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

import MaterialActiveConcept from '../concept/MaterialActiveConcept'

const styles = theme => ({
  root: {
    width: '270px',
    marginLeft: '10px'
  },
  list: {
    // width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    paddingBottom: theme.spacing.unit * 2,
    // position: 'relative',
    // overflow: 'auto',
    maxHeight: 500,
  },
  cardHeader: {
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
  activeConceptId,
  deleteConcept,
  createConcept
}) => {

  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({ open: false, id: '', name: '', description: '' })

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const handleConceptClose = () => {
    setConceptState({ open: false, id: '' })
  }

  const handleConceptOpen = (id) => () => {
    setConceptState({ open: true, id })
  }

  const handleConceptEditClose = () => {
    setConceptEditState({ open: false, id: '', name: '', description: '' })
  }

  const handleConceptEditOpen = (id, name, description) => () => {
    console.log('hello', id)
    setConceptEditState({ open: true, id, name, description })
  }


  return (
    <div>
      <Card elevation={3} className={classes.root}>
        <CardHeader className={classes.cardHeader} title={course.name}>
        </CardHeader>

        <CardContent>
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

          <Button
            className={classes.button}
            onClick={handleConceptOpen(course.id)}
            variant="contained"
            color="primary"
          >
            Add concept
          </Button>
        </CardContent>
      </Card>

      <UpdateConceptDialog state={conceptEditState} handleClose={handleConceptEditClose} updateConcept={updateConcept} />
      <AddConceptDialog state={conceptState} handleClose={handleConceptClose} createConcept={createConcept} />
    </div>
  )
}

const AddConceptDialog = ({ state, handleClose, createConcept }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleConceptAdding = async () => {
    await createConcept({
      variables: {
        course_id: state.id,
        name,
        description,
        official: false
      }
    })
    setName('')
    setDescription('')
    handleClose()
  }

  return (<Dialog
    open={state.open}
    onClose={handleClose}
    aria-labelledby="form-dialog-title">
    <DialogTitle id="form-dialog-title">
      Add concept
    </DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        id="name"
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />

      <TextField
        multiline
        margin="dense"
        id="description"
        label="Description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        variant="outlined"
      />
    </DialogContent>



    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Cancel
        </Button>
      <Button onClick={handleConceptAdding} color="primary">
        Add concept
        </Button>
    </DialogActions>
  </Dialog>)


}

const UpdateConceptDialog = ({ state, handleClose, updateConcept }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleConceptUpdate = async () => {
    await updateConcept({
      variables: {
        id: state.id,
        name,
        description
      }
    })
    setName('')
    setDescription('')
    handleClose()
  }

  return (<Dialog
    open={state.open}
    onClose={handleClose}
    aria-labelledby="form-dialog-title">
    <DialogTitle id="form-dialog-title">
      Edit concept
    </DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        id="name"
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />

      <TextField
        multiline
        margin="dense"
        id="description"
        label="Description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        variant="outlined"
      />
    </DialogContent>



    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Cancel
        </Button>
      <Button onClick={handleConceptUpdate} color="primary">
        Save
        </Button>
    </DialogActions>
  </Dialog>)
}

export default withStyles(styles)(MaterialActiveCourse)