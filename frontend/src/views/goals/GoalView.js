import React from 'react'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    overflow: 'hidden',
    gridGap: '16px',
    gridTemplate: `"header  header"   56px
                   "courses goals" 1fr
                  / 1fr     1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    }
  },
  emptyBox: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    border: '1px dashed black'
  }
}))

const Goals = () => {
  const classes = useStyles()

  return (
    <div className={classes.emptyBox}>
      TODO: GOALS
    </div>
  )
}

const Courses = () => {
  const classes = useStyles() 

  return (
    <div className={classes.emptyBox}>
      TODO: GOALS
    </div>
  )
}

const GoalView = () => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <h2> Courses </h2>
      <h2> Goals </h2>
      <Courses />
      <Goals />
    </div>
  )
}

export default GoalView