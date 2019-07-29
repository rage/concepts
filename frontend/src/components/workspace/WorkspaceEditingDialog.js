import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@material-ui/core'

import { useMessageStateValue } from '../../store'

const WorkspaceEditingDialog = ({ state, handleClose, updateWorkspace, defaultName }) => {
  const [name, setName] = useState('')
  const [submitDisabled, setSubmitDisabled] = useState(false)

  const messageDispatch = useMessageStateValue()[1]

  useEffect(() => {
    if (state.open) {
      setSubmitDisabled(false)
    }
    setName(defaultName)
  }, [defaultName, state])

  const handleEdit = async () => {
    if (submitDisabled) return
    if (name === '') {
      window.alert('Workspace needs a name!')
      return
    }
    setSubmitDisabled(true)
    const shouldUpdate = defaultName !== name
    if (shouldUpdate) {
      try {
        if (defaultName !== name) {
          await updateWorkspace({
            variables: { id: state.id, name }
          })
        }
      } catch (err) {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
    handleClose()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      handleEdit(e)
    }
  }

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>Edit workspace</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Workspaces work as a sandbox for you to create and connect concepts with each other.
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
          onClick={handleEdit}
          disabled={submitDisabled}
          color='primary'
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WorkspaceEditingDialog
