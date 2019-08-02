import React, { useState } from 'react'
import {
  Button
} from '@material-ui/core'

import { useMessageStateValue } from '../store'

const LinkSharingActions = ({
  project, handleClose, createProjectShareLink, deleteProjectShareLink,
  privilege
}) => {
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const messageDispatch = useMessageStateValue()[1]

  const existingToken = project && project.tokens.find(token => token.privilege === privilege)

  const existingTokenId = existingToken && existingToken.id

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

  return <>
    {realURL && <Button
      onClick={copyToClipboard}
      color='secondary'
    >
      Copy to clipboard
    </Button>
    }

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
  </>
}

export default LinkSharingActions
