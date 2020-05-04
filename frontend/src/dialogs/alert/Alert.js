import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Dialog, DialogTitle, DialogActions, DialogContent, Button, FormControlLabel,
  Checkbox, FormControl
} from '@material-ui/core'

import '../../lib/deferred'

// Types: info, warning
const defaultValues = {
  open: false,
  type: 'info',
  title: '',
  message: '',
  cancel: '',
  confirm: 'OK',
  confirmColor: 'primary',
  cancelColor: 'primary',
  checkboxes: []
}

const useStyles = makeStyles({

})

const Alert = ({ contextRef }) => {
  const classes = useStyles()
  const [state, setState] = useState({ ...defaultValues })

  const checkboxValue = cb => state.hasOwnProperty(cb.id) ? state[cb.id] : cb.default

  const getResolveValue = (ok) => {
    if (state.checkboxes.length === 0) {
      return ok
    }
    return {
      ok,
      ...Object.fromEntries(state.checkboxes.map(
        checkbox => [checkbox.id, checkboxValue(checkbox)]))
    }
  }

  contextRef.current = {
    open(args) {
      const promise = Promise.defer()
      setState({ ...defaultValues, ...args, promise, open: true })
      return promise
    },
    close(value) {
      if (!state.promise) {
        return
      }
      state.promise.resolve(value)
      setState({ ...state, promise: null, open: false })
    },
    resolve() {
      contextRef.current.close(getResolveValue(true))
    },
    reject() {
      contextRef.current.close(getResolveValue(false))
    }
  }

  return (
    <Dialog onClose={contextRef.current.reject} open={state.open} className={classes[state.type]}>
      <DialogTitle>{state.title}</DialogTitle>
      {(state.message || state.checkboxes.length > 0) && <DialogContent>
        <Typography gutterBottom>
          {state.message}
        </Typography>
        {state.checkboxes.map(checkbox => (
          <FormControl
            style={{ verticalAlign: 'middle', marginRight: '12px' }}
            key={checkbox.name}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkboxValue(checkbox)}
                  onChange={evt =>
                    setState({ ...state, [checkbox.id]: evt.target.checked })}
                  value={checkbox.id}
                  color='primary'
                />
              }
              label={checkbox.name}
            />
          </FormControl>
        ))}
      </DialogContent>}

      <DialogActions>
        {state.cancel &&
          <Button onClick={contextRef.current.reject} color={state.cancelColor}>
            {state.cancel}
          </Button>
        }
        {state.confirm &&
          <Button onClick={contextRef.current.resolve} color={state.confirmColor}>
            {state.confirm}
          </Button>
        }
      </DialogActions>
    </Dialog>
  )
}

export default Alert
