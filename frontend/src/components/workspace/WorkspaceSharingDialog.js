import React, { useState, useEffect } from 'react'

import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@material-ui/core'

import { useErrorStateValue } from '../../store'

const WorkspaceSharingDialog = ({ state, handleClose  }) => {
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const errorDispatch = useErrorStateValue()[1]

  const handleRegenerate = () => {
    setSubmitDisabled(true)
  }

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>Share workspace</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Workspaces work as a sandbox for you to create and connect concepts with each other.
        </DialogContentText>
        <TextField
          autoFocus
          disabled
          margin='dense'
          id='link'
          label='Link'
          type='text'
          value={link || 'Generating...'}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleRegenerate}
          disabled={submitDisabled}
          color='primary'
        >
          Regenerate link
        </Button>
        <Button onClick={handleClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WorkspaceSharingDialog
