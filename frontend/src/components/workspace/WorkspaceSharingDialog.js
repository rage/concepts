import React, { useState } from 'react'

import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@material-ui/core'

import { useErrorStateValue } from '../../store'

const WorkspaceSharingDialog = ({ open, workspace, handleClose, createShareLink }) => {
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const errorDispatch = useErrorStateValue()[1]

  const handleRegenerate = () => {
    setSubmitDisabled(true)
    createShareLink({
      variables: {
        workspaceId: workspace.id,
        privilege: 'EDIT'
      }
    }).catch(() => errorDispatch({
      type: 'setError',
      data: 'Access denied'
    })).then(() => setSubmitDisabled(false))
  }

  let url = 'No share links created'
  if (workspace && workspace.tokens.length > 0) {
    const realURL = new URL(window.location)
    realURL.pathname = `/join/w${workspace.tokens[0].id}`
    url = <a href={realURL}>{realURL.host}{realURL.pathname}</a>
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
        <DialogContentText>
          {url}
        </DialogContentText>
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
