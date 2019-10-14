import React from 'react'
import { Button, makeStyles } from '@material-ui/core'

const useStyles = makeStyles({
  root: {
    textAlign: 'center',
    margin: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
})

export const MIN_WIDTH = 700

const WindowTooSmall = ({ rerender }) => {
  const classes = useStyles()
  const ignoreSize = () => {
    window.localStorage.ignoreWindowSize = true
    rerender()
  }
  const canGrowWindow = window.screen.availWidth >= MIN_WIDTH
  if (canGrowWindow) {
    const listener = () => {
      if (window.innerWidth >= MIN_WIDTH) {
        window.removeEventListener('resize', listener)
        rerender()
      }
    }
    window.addEventListener('resize', listener)
  }
  return (
    <div className={classes.root}>
      {canGrowWindow ?
        <div>
          <h1>Your browser window is too small for Concepts.</h1>
          <p>Please resize your browser window.</p>
        </div> : <div>
          <h1>Your display is too small for Concepts.</h1>
          <p>
            Please use a computer with a larger display.
            Concepts is not supported on mobile devices.
          </p>
        </div>
      }
      <Button fullWidth color='primary' variant='outlined' onClick={ignoreSize}>
        I don't care
      </Button>
    </div>
  )
}

export default WindowTooSmall
