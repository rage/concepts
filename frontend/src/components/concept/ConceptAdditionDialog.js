import React, { useState } from 'react'

//  dialog
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

// Materal common
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

const ConceptAdditionDialog = ({ state, handleClose, createConcept }) => {
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

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
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
    </Dialog>
  )
}

export default ConceptAdditionDialog