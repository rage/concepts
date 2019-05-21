import React, { useState } from 'react'
import Course from './Course'
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
// import { CREATE_CONCEPT } from '../../services/ConceptService'

const AddConceptDialog = ({ state, handleClose, createConcept }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleConceptAdding = async () => {
      await createConcept({
        variables: {
          course_id: state.id,
          name,
          description,
          official:false
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
        margin="dense"
        id="description"
        label="Description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
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
  const [courseState, setCourseState] = useState({ open: false, id: '' })
  const [conceptState, setConceptState] = useState({ open: false, id: '' })

  const updateCourse = useMutation(UPDATE_COURSE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  // const createConcept = useMutation(CREATE_CONCEPT, {
  //   refetchQueries: [{ query: ALL_COURSES }]
  // })

  const handleCourseClose = () => {
    setCourseState({ open: false, id: '' })
  }

  const handleCourseOpen = (id) => () => {
    setCourseState({ open: true, id })
  }

  const handleConceptClose = () => {
    setConceptState({ open: false, id: '' })
  }

  const handleConceptOpen = (id) => () => {
    setConceptState({ open: true, id })
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
          />
        )
      }
      <EditCourseDialog state={courseState} handleClose={handleCourseClose} updateCourse={updateCourse} />
      <AddConceptDialog state={conceptState} handleClose={handleConceptClose} createConcept={createConcept}/>
    </div>
  )
}

export default CourseContainer