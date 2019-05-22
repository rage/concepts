import React, { useState, useEffect } from 'react'
import MaterialCourse from './MaterialCourse'

// Dialog
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';


import { useMutation } from 'react-apollo-hooks'
import { ALL_COURSES, UPDATE_COURSE } from '../../services/CourseService'
import { UPDATE_CONCEPT } from '../../services/ConceptService'

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

const EditCourseDialog = ({ state, handleClose, updateCourse }) => {
  const [name, setName] = useState('')

  const handleCourseEdit = async () => {
    await updateCourse({
      variables: {
        id: state.id,
        name
      }
    })
    setName('')
    handleClose()
  }


  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        Edit course
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
      </DialogContent>



      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
          </Button>
        <Button onClick={handleCourseEdit} color="primary">
          Save
          </Button>
      </DialogActions>
    </Dialog>
  )
}


const CourseContainer = ({ courses, linkPrerequisite, activeConceptId, deleteLink, createConcept, deleteConcept }) => {
  const [courseState, setCourseState] = useState({ open: false, id: '', name: '' })
  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({ open: false, id: '', name: '', description: '' })

  const updateCourse = useMutation(UPDATE_COURSE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  // const createConcept = useMutation(CREATE_CONCEPT, {
  //   refetchQueries: [{ query: ALL_COURSES }]
  // })

  const handleCourseClose = () => {
    setCourseState({ open: false, id: '' })
  }

  const handleCourseOpen = (id, name) => () => {
    setCourseState({ open: true, id, name })
  }

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
    <div className="curri-column-container">
      {
        courses && courses.map(course =>
          <MaterialCourse
            key={course.id}
            course={course}
            linkPrerequisite={linkPrerequisite}
            deleteLink={deleteLink}
            activeConceptId={activeConceptId}
            createConcept={createConcept}
            openCourseDialog={handleCourseOpen}
            openConceptDialog={handleConceptOpen}
            openConceptEditDialog={handleConceptEditOpen}
            deleteConcept={deleteConcept}
          />
        )
      }
      <UpdateConceptDialog state={conceptEditState} handleClose={handleConceptEditClose} updateConcept={updateConcept} />
      <EditCourseDialog state={courseState} handleClose={handleCourseClose} updateCourse={updateCourse} />
      <AddConceptDialog state={conceptState} handleClose={handleConceptClose} createConcept={createConcept} />
    </div>
  )
}

export default CourseContainer