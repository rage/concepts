import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, FormControlLabel, Button, Checkbox, IconButton, FormControl, Typography
} from '@material-ui/core'
import {
  NavigateNext as NextIcon, NavigateBefore as PrevIcon
} from '@material-ui/icons'

import introContent from '../../static/introContent'

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
  type: 'workspace',
  step: 0
})

const IntroDialogContent = ({ currentCardContent }) => (
  <DialogContent>
    <DialogTitle>{currentCardContent.title}</DialogTitle>
    <DialogContentText>{currentCardContent.description}</DialogContentText>
    {currentCardContent.video && <video controls autoPlay muted width='100%' height='100%'>
      <source src={currentCardContent.video} type='video/webm' />
    </video>}
  </DialogContent>
)

const IntroDialog = ({ contextRef }) => {
  const [state, setState] = useState(blankState())
  const [inputState, setInputState] = useState({
    noShowAgain: false
  })
  const classes = useStyles()

  const currentIntroContent = state.type ? introContent.types[state.type] : null

  const local = {
    get hasNext() {
      return currentIntroContent?.length > state.step + 1
    },
    get hasPrev() {
      return state.step > 0
    }
  }

  const closeDialog = () => {
    // Other cleanup
    setState({ ...state, open: false })
  }

  contextRef.current.closeDialog = closeDialog

  contextRef.current.openDialog = (type) => {
    // Other state changes
    setState({ ...state, open: true, type })
  }

  const showNext = () => {
    setState((prevState) => ({ ...prevState, step: prevState.step + 1 }))
  }
  const showPrev = () => {
    setState((prevState) => ({ ...prevState, step: prevState.step - 1 }))
  }

  console.log(currentIntroContent)

  return (
    <MuiDialog maxWidth='xl' open={state.open} onClose={closeDialog}>
      {
        currentIntroContent && state.type &&
        <IntroDialogContent currentCardContent={currentIntroContent[state.step]} />
      }
      <DialogActions>
        <div>
          <IconButton
            className={`${classes.button} ${!local.hasPrev ? classes.invisible : ''}`}
            onClick={showPrev} disabled={!local.hasPrev}
          >
            <PrevIcon />
          </IconButton>
          <IconButton
            className={`${classes.button} ${!local.hasNext ? classes.invisible : ''}`}
            onClick={showNext} disabled={!local.hasNext}
          >
            <NextIcon />
          </IconButton>
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
        </div>
      </DialogActions>
    </MuiDialog>
  )
}

export default IntroDialog
