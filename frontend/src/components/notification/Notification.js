import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import {
  Dialog, DialogTitle, DialogActions, DialogContent, Button
} from '@material-ui/core'

const defaultValues = () => ({
  open: false,
  title: '',
  type: '',
  message: '',
  onClick: () => {}
})

const Notification = ({ contextRef }) => {
  const [state, setState] = useState(defaultValues())

  const open = ({ title, type, message, onClick }) => {
    setState({
      title,
      type,
      message,
      onClick
    })
  }

  const close = () => {
    if (!state.promise) return
    setState({...state, open: false})
  }

  return (
    <Dialog onClose={close} open={state.open}>
      <DialogTitle> { state.title } </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          { state.message }
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button autoFocus onClick={close} color="primary">
          Cancel
        </Button>
        <Button autoFocus onClick={() => {
          state.onClick()
          close()
        }} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Notification