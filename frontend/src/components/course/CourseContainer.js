import React, { useState } from 'react'
import Course from './Course'
import MaterialCourse from './MaterialCourse'

// Dialog
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';


import { useMutation } from 'react-apollo-hooks'
import { ALL_COURSES,  UPDATE_COURSE } from '../../services/CourseService'


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


const CourseContainer = ({ courses, linkPrerequisite, activeConceptId, deleteLink, createConcept }) => {
  const [state, setState] = useState({open: false, id: ''})

  const updateCourse = useMutation(UPDATE_COURSE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const handleClose = () => {
    setState({open: false, id: ''})
  }

  const handleOpen = (id) => () => {
    setState({ open: true, id})
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
          openDialog={handleOpen}
        />
      )
    }
    <EditCourseDialog state={state} handleOpen={handleOpen} handleClose={handleClose} updateCourse={updateCourse}/>
  </div>
  )
}

export default CourseContainer