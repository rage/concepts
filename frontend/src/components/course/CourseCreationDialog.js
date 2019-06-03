import React, { useState } from 'react'

// Material dialog
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

// Materal common
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

const CourseCreationDialog = ({ state, handleClose, createCourse }) => {
  const [name, setName] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (name === '') {
      window.alert('Course needs a name!')
      return
    }

    await createCourse({
      variables: { name }
    })
    setName('')
    handleClose()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      handleCreate(e)
    }
  }

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Create course</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Courses can be connected to other courses as prerequisites.
          </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          onKeyPress={handleKey}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
          </Button>
        <Button onClick={handleCreate} color="primary">
          Create
          </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CourseCreationDialog