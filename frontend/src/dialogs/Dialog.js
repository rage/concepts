import React, { useState, useEffect } from 'react'
import {
  Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@material-ui/core'

import { useMessageStateValue } from '../store'

const Dialog = ({
  open, onClose, mutation, requiredVariables,
  actionText, fields, title, content, CustomActions
}) => {
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [state, setState] = useState(Object.fromEntries(fields.map(key => [key.name, ''])))

  const messageDispatch = useMessageStateValue()[1]

  useEffect(() => {
    if (open) {
      setState(Object.fromEntries(fields.map(key => [key.name, ''])))
      setSubmitDisabled(false)
    }
  }, [open])

  const handleSubmit = () => {
    if (submitDisabled) return
    const variables = Object.fromEntries(fields.map(key => [key.name, state[key.name].trim()]))
    for (const key of fields) {
      if (variables[key.name] === '' && key.required) {
        window.alert('Concept needs a name!')
        return
      }
    }
    setSubmitDisabled(true)
    mutation({ ...requiredVariables, variables })
      .catch(() => {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      })
      .finally(onClose)
  }

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>
        {title}
      </DialogTitle>
      <DialogContent id='form-dialog-content'>
        {
          content && content !== ''
            ?
            content.map(contentText =>
              <DialogContentText>
                {contentText}
              </DialogContentText>
            )
            : null

        }
        {
          fields.map((key, index) =>
            <TextField
              autoFocus={index === 0}
              variant='outlined'
              margin='dense'
              id={key}
              label={key[0].toUpperCase() + key.substr(1)}
              type='text'
              value={state[key.name]}
              onChange={(e) => setState({ ...state, [key.name]: e.target.value })}
              fullWidth
              multiline={key.multiline}
            />
          )
        }
      </DialogContent>
      {
        CustomActions ||
        <DialogActions id='form-dialog-default-actions'>
          <Button onClick={onClose} color='primary'>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitDisabled}
            color='primary'
          >
            {actionText}
          </Button>
        </DialogActions>
      }
    </MuiDialog>
  )
}

export default Dialog
