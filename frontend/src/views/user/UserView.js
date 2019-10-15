import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

const useStyles = makeStyles({
  root: {

  }
})

const UserView = () => {
  const classes = useStyles()

  return <Container component='main' maxWidth='sm'>
    Hello, World!
  </Container>
}

export default UserView
