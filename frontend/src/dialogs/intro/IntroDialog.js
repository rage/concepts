import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Button, Checkbox, IconButton, FormControl, Typography
} from '@material-ui/core'
import {
  NavigateNext as NextIcon, NavigateBefore as PrevIcon
} from '@material-ui/icons'

const useStyles = makeStyles(() => ({
  root: {

  },
  button: {
    color: 'black',
    borderColor: 'black'
  },
  invisible: {
    visibility: 'hidden'
  }
}))

const blankState = () => ({
  open: false,
  actionText: '',
  content: ['Text one more time', 'Another text', 'This is also text'],
  title: 'TITLE',
  type: '',
  step: 0,
  maxStep: 3
})

const IntroDialog = ({ contextRef }) => {
  const [state, setState] = useState(blankState())
  const [inputState, setInputState] = useState({
    noShowAgain: false
  })
  const classes = useStyles()

  const closeDialog = () => {
    // Other cleanup
    setState({ ...state, open: false })
  }

  contextRef.current.closeDialog = closeDialog

  contextRef.current.openDialog = () => {
    // Other state changes
    setState({ ...state, open: true })
  }

  const showNext = () => {
    setState((prevState) => ({ ...prevState, step: prevState.step + 1 }))
  }
  const showPrev = () => {
    setState((prevState) => ({ ...prevState, step: prevState.step - 1 }))
  }

  return (
    <MuiDialog open={state.open} onClose={closeDialog}>
      <DialogTitle>{state.title}</DialogTitle>
      <DialogContent>
        {
          state.content.map((contentText, i) =>
            <DialogContentText key={i}>
              {contentText}
            </DialogContentText>
          )
        }
        <Typography>
          {state.step}
        </Typography>
      </DialogContent>
      <DialogActions>
        <div>
          <IconButton
            className={`${classes.button} ${state.step === 0 ? classes.invisible : ''}`}
            onClick={showPrev} disabled={state.step === 0}
          >
            <PrevIcon />
          </IconButton>
          <IconButton
            className={`${classes.button} ${state.step === state.maxStep ? classes.invisible : ''}`}
            onClick={showNext} disabled={state.step === state.maxStep}
          >
            <NextIcon />
          </IconButton>
        </div>
        <FormControl
          style={{ verticalAlign: 'middle', marginRight: '12px' }}
          key='Do not show again'
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={inputState.noShowAgain}
                onChange={evt => setInputState({ ...inputState, noShowAgain: evt.target.checked })}
                value='Do not show again'
                color='primary'
              />
            }
            label='Do not show again'
          />
        </FormControl>
        <Button onClick={closeDialog} color='primary'>
          Close
        </Button>
      </DialogActions>
    </MuiDialog>
  )
}

export default IntroDialog
