import React from 'react'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

import { withRouter } from 'react-router-dom'
import { useLoginStateValue } from '../../store'

import {
  CREATE_GUEST_ACCOUNT
} from '../../graphql/Mutation'

import { useMutation } from 'react-apollo-hooks'

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(2)
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  }
}))

const LandingView = (props) => {
  const { loggedIn } = useLoginStateValue()[0]
  const dispatch = useLoginStateValue()[1]

  const createGuestMutation = useMutation(CREATE_GUEST_ACCOUNT)

  const classes = useStyles()
  const redirectTo = (path) => () => {
    props.history.push(path)
  }

  const createGuestAccount = async () => {
    const result = await createGuestMutation()
    const userData = result.data.createGuest
    await window.localStorage.setItem('current_user', JSON.stringify(userData))
    await dispatch({
      type: 'login',
      data: userData.user
    })
  }

  const navigateToGuestWorkspace = async () => {
    if (!loggedIn) {
      await createGuestAccount()
    }
    props.history.push('/user')
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <div className={classes.heroContent}>
        <Container maxWidth='sm'>
          <Typography component='h1' variant='h2' align='center' color='textPrimary' gutterBottom>
            Curriculum mapper
          </Typography>
          <Typography variant='h5' align='center' color='textSecondary' paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
          </Typography>
          <div className={classes.heroButtons}>
            <Grid container spacing={2} justify='center'>
              <Grid item>
                <Button variant='contained' color='primary' onClick={loggedIn ? redirectTo('/user') : redirectTo('/auth')}>
                  {loggedIn ? 'Choose workspace' : 'Login and choose workspace'}
                </Button>
              </Grid>
              {
                !loggedIn &&
                <Grid item>
                  <Button variant='outlined' color='primary' onClick={navigateToGuestWorkspace}>
                  Continue as guest
                  </Button>
                </Grid>
              }
            </Grid>
          </div>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default withRouter(LandingView)
