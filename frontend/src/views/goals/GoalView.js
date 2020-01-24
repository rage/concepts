import React from 'react'
import { makeStyles } from '@material-ui/core'
import { Card, CardHeader } from '@material-ui/core'

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
  card: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    gridArea: 'header'
  }
}))

const Goals = () => {
  const classes = useStyles()

  return (
    <Card elevation={0} className={classes.card}>
    <CardHeader title='Goals'/>
  </Card>
  )
}

const Courses = () => {
  const classes = useStyles() 

  return (
    <Card elevation={0} className={classes.card}>
      <CardHeader title='Courses'/>
    </Card>
  )
}

const GoalView = () => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <h1 className={classes.title}> Goal Mapping </h1>
      <Courses />
      <Goals />
    </div>
  )
}

export default GoalView