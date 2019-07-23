import React, { useState } from 'react'

import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@material-ui/core'

const WorkspaceSharingDialog = ({ open, workspace, handleClose  }) => {
  const [submitDisabled, setSubmitDisabled] = useState(false)

  const handleRegenerate = () => {
    setSubmitDisabled(true)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>Share workspace</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Let other users view and edit your workspace
        </DialogContentText>
        <TextField
          autoFocus
          disabled
          margin='dense'
          id='link'
          label='Link'
          type='text'
          value={workspace && workspace.tokens.length ?
            workspace.tokens[0].id : 'No share links created'}
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
