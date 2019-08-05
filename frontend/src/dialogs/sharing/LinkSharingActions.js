import React from 'react'
import { Button } from '@material-ui/core'

import { useMessageStateValue } from '../../store'

const LinkSharingActions = ({ closeDialog, handleSubmit, submitDisabled, url }) => {
  const [, messageDispatch] = useMessageStateValue()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
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

  return <>
    {
      url && <Button onClick={copyToClipboard} color='secondary'>
        Copy to clipboard
      </Button>
    }

    <Button onClick={() => handleSubmit(false)} disabled={submitDisabled} color='primary'>
      {submitDisabled ? 'Generating...' : url ? 'Regenerate link' : 'Generate link'}
    </Button>
    <Button onClick={closeDialog} color='primary'>
      Close
    </Button>
  </>
}

export default LinkSharingActions
