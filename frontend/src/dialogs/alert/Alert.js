import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Dialog, DialogTitle, DialogActions, DialogContent, Button
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
  cancelColor: 'primary'
}

const useStyles = makeStyles({

})

const Alert = ({ contextRef }) => {
  const classes = useStyles()
  const [state, setState] = useState({ ...defaultValues })

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
      contextRef.current.close(true)
    },
    reject() {
      contextRef.current.close(false)
    }
  }

  return (
    <Dialog onClose={contextRef.current.close} open={state.open} className={classes[state.type]}>
      <DialogTitle>{state.title}</DialogTitle>
      {state.message && <DialogContent>
        <Typography gutterBottom>
          {state.message}
        </Typography>
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
