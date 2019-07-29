import React, { useState } from 'react'
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@material-ui/core'

import { useMessageStateValue } from '../../store'

const ProjectSharingDialog = ({
  open, project, handleClose, createProjectShareLink, deleteProjectShareLink,
  privilege, title, description
}) => {
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const messageDispatch = useMessageStateValue()[1]

  const existingToken = project && project.tokens.find(token => {
    console.log(token, token.privilege)
    console.log('Q: ', privilege)
    return token.privilege === privilege
  })

  const existingTokenId = existingToken && existingToken.id

  console.log(existingToken)

  const handleRegenerate = () => {
    setSubmitDisabled(true)
    const del = () => createProjectShareLink({
      variables: {
        projectId: project.id,
        privilege
      }
    })

    const promise = existingTokenId ? deleteProjectShareLink({
      variables: {
        id: existingTokenId
      }
    }).then(del) : del()
    promise.catch(() => messageDispatch({
      type: 'setError',
      data: 'Access denied'
    })).then(() => setSubmitDisabled(false))
  }

  let url = 'No share links created'
  let realURL = null
  if (existingTokenId) {
    realURL = new URL(window.location)
    realURL.pathname = `/join/${existingTokenId}`
    url = <a href={realURL}>{realURL.host}{realURL.pathname}</a>
  }

  const copyToClipboard = () => {
    if (existingTokenId) {
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
      <DialogTitle id='form-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {description}
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
          {submitDisabled ? 'Generating...' : existingTokenId ? 'Regenerate link' : 'Generate link'}
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
