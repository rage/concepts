import React, { useState } from 'react'

import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@material-ui/core'

import { useMessageStateValue } from '../../store'

const ProjectSharingDialog = ({
  open, project, handleClose, createProjectShareLink, deleteProjectShareLink
}) => {
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const messageDispatch = useMessageStateValue()[1]

  const existingToken = project && project.tokens.length > 0 ? project.tokens[0].id : null

  const handleRegenerate = () => {
    setSubmitDisabled(true)
    const del = () => createProjectShareLink({
      variables: {
        proId: project.id,
        privilege: 'EDIT'
      }
    })

    const promise = existingToken ? deleteProjectShareLink({
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
  let realURL = null
  if (existingToken) {
    realURL = new URL(window.location)
    realURL.pathname = `/join/${existingToken}`
    url = <a href={realURL}>{realURL.host}{realURL.pathname}</a>
  }

  const copyToClipboard = () => {
    if (existingToken) {
      navigator.clipboard.writeText(realURL.toString()).then(() => {
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
      <DialogTitle id='form-dialog-title'>Share project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Let other users view and edit your project
        </DialogContentText>
        <DialogContentText>
          {url}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {realURL && <Button
          onClick={copyToClipboard}
          color='secondary'
        >
          Copy to clipboard
        </Button>}

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

export default ProjectSharingDialog
