import React from 'react'
import { Button } from '@material-ui/core'

import { useMessageStateValue } from '../../lib/store'

const LinkSharingActions = ({ ctx, handleSubmit, submitDisabled, url }) => {
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

    <Button
      onClick={() => handleSubmit({ close: false })} disabled={submitDisabled} color='primary'
    >
      {submitDisabled ? 'Generating...' : url ? 'Regenerate link' : 'Generate link'}
    </Button>
    <Button onClick={ctx.closeDialog} color='primary'>
      Close
    </Button>
  </>
}

export default LinkSharingActions
