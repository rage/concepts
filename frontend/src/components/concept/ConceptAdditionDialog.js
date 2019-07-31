import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField
} from '@material-ui/core'

import { useMessageStateValue } from '../../store'

const ConceptAdditionDialog = ({ state, handleClose, createConcept, workspaceId }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitDisabled, setSubmitDisabled] = useState(false)

  const messageDispatch = useMessageStateValue()[1]

  useEffect(() => {
    if (state.open) {
      setName('')
      setDescription('')
      setSubmitDisabled(false)
    }
  }, [state])

  const handleConceptAdding = () => {
    if (submitDisabled) return
    if (name.trim() === '') {
      window.alert('Concept needs a name!')
      return
    }
    setSubmitDisabled(true)
    createConcept({
      variables: {
        courseId: state.id,
        workspaceId,
        name,
        description,
        official: false
      }
    })
      .catch(() => {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      })
      .finally(handleClose)
  }

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>
        Add concept
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          id='name'
          label='Name'
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          multiline
          margin='dense'
          id='description'
          label='Description'
          type='text'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant='outlined'
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          Cancel
        </Button>
        <Button
          onClick={handleConceptAdding}
          disabled={submitDisabled}
          color='primary'
        >
          Add concept
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConceptAdditionDialog
