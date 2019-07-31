import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@material-ui/core'

import { useMessageStateValue } from '../../store'

const WorkspaceEditingDialog = ({ state, handleClose, updateProject, defaultName }) => {
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
    const projectName = name.trim()
    if (projectName === '') {
      window.alert('Project needs a name!')
      return
    }
    setSubmitDisabled(true)
    try {
      if (defaultName !== projectName) {
        await updateProject({
          variables: {
            id: state.id,
            name: projectName
          }
        })
      }
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
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
      <DialogTitle id='form-dialog-title'>Edit project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Projects are used to manage the creation of workspaces
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
