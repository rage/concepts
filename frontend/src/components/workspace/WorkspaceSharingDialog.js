import React, { useState } from 'react'

import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@material-ui/core'

import { useMessageStateValue } from '../../store'

const WorkspaceSharingDialog = ({
  open, workspace, handleClose, createShareLink, deleteShareLink
}) => {
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const messageDispatch = useMessageStateValue()[1]

  const existingToken = workspace && workspace.tokens.length > 0 ? workspace.tokens[0].id : null

  const handleRegenerate = () => {
    setSubmitDisabled(true)
    const del = () => createShareLink({
      variables: {
        workspaceId: workspace.id,
        privilege: 'EDIT'
      }
    })

    const promise = existingToken ? deleteShareLink({
      variables: {
        id: existingToken
      }
    }).then(del) : del()
    promise.catch(() => messageDispatch({
      type: 'setError',
      data: 'Access denied'
    })).then(() => setSubmitDisabled(false))
  }

  let url = 'No share links created'
  if (existingToken) {
    const realURL = new URL(window.location)
    realURL.pathname = `/join/w${existingToken}`
    url = <a href={realURL}>{realURL.host}{realURL.pathname}</a>
  }

  const copyToClipboard = () => {
    if (existingToken) {
      navigator.clipboard.writeText(`${window.location}/join/w${existingToken}`).then(() => {
        messageDispatch({
          type: 'setNotification',
          data: 'Copied to clipboard!'
        })
      }, (err) => {
        messageDispatch({
          type: 'setError',
          data: err.message
        })
      })
    }
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
          onClick={copyToClipboard}
          color='secondary'
        >
          Copy to clipboard
        </Button>

        <Button
          onClick={handleRegenerate}
          disabled={submitDisabled}
          color='primary'
        >
          {submitDisabled ? 'Generating...' : existingToken ? 'Regenerate link' : 'Generate link'}
        </Button>
        <Button
          onClick={handleClose}
          color='primary'
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WorkspaceSharingDialog
