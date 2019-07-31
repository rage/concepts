import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@material-ui/core'

import { useMessageStateValue } from '../../store'

const TemplateCreationDialog = ({ state, handleClose, createTemplateWorkspace, projectId }) => {
  const messageDispatch = useMessageStateValue()[1]
  const [name, setName] = useState('')
  const [submitDisabled, setSubmitDisabled] = useState(false)

  useEffect(() => {
    if (state.open) {
      setName('')
      setSubmitDisabled(false)
    }
  }, [state])

  const handleCreate = () => {
    if (submitDisabled) return
    if (name.trim() === '') {
      window.alert('Workspace needs a name!')
      return
    }
    setSubmitDisabled(true)
    createTemplateWorkspace({
      variables: { name, projectId }
    })
      .catch(() => {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      })
      .finally(handleClose)
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
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>Create template workspace</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Templates are workspaces, which will be cloned by users for their own mapping.
          User workspaces can later be merged.
        </DialogContentText>
        <TextField
          autoFocus
          margin='dense'
          id='name'
          label='Name'
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          onKeyPress={handleKey}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={submitDisabled}
          color='primary'
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TemplateCreationDialog
