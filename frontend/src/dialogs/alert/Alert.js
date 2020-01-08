import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Dialog, DialogTitle, DialogActions, DialogContent, Button
} from '@material-ui/core'

// Types: info, warning
const defaultValues = {
  open: false,
  type: 'info',
  title: '',
  message: '',
  cancel: '',
  confirm: 'OK'
}

const classes = makeStyles({

})

const Alert = ({ contextRef }) => {
  const [state, setState] = useState({ ...defaultValues })

  contextRef.current = {
    open(args) {
      let _resolve
      const promise = new Promise(resolve => _resolve = resolve)
      promise.resolve = _resolve
      setState({ ...defaultValues, ...args, promise, open: true })
      return promise
    },
    close() {
      setState({ ...state, open: false })
    },
    resolve() {
      state.promise.resolve(true)
      contextRef.current.close()
    },
    reject() {
      state.promise.resolve(false)
      contextRef.current.close()
    }
  }

  return (
    <Dialog onClose={contextRef.current.close} open={state.open} className={classes[state.type]}>
      <DialogTitle>{state.title}</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          {state.message}
        </Typography>
      </DialogContent>

      <DialogActions>
        {state.cancel && <Button onClick={contextRef.current.reject} color='primary'>
          {state.cancel}
        </Button>}
        <Button onClick={contextRef.current.resolve} color='primary'>
          {state.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Alert
