import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {

  }
})

const UserView = () => {
  const classes = useStyles()

  return <main className={classes.root}>
    Hello, World!
  </main>
}

export default UserView
