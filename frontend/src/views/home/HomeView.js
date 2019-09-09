import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Grid, Typography, Container } from '@material-ui/core'

import { useLoginStateValue } from '../../store'
import { CREATE_GUEST_ACCOUNT } from '../../graphql/Mutation'
import UserViewContent from './UserViewContent'

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(2)
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  }
}))

const HomeView = ({ history }) => {
  const classes = useStyles()
  const [{ loggedIn, user }, dispatch] = useLoginStateValue()
  const [createGuestMutation] = useMutation(CREATE_GUEST_ACCOUNT)

  const createGuestAccount = async () => {
    const result = await createGuestMutation()
    const userData = result.data.createGuest
    window.localStorage.currentUser = JSON.stringify(userData)
    await dispatch({
      type: 'login',
      data: userData.user
    })
  }

  const navigateToGuestWorkspace = async () => {
    if (!loggedIn) {
      await createGuestAccount()
    }
  }

  if (loggedIn) {
    return <UserViewContent user={user} />
  }

  return (
    <div className={classes.heroContent}>
      <Container maxWidth='sm'>
        <Typography component='h1' variant='h2' align='center' color='textPrimary' gutterBottom>
          Concepts
        </Typography>
        <Typography variant='h6' align='center' color='textSecondary' paragraph>
          The concepts tool provides the ability for study programmes to gain a better picture of
          their study plan, while students are able to practice mapping the concepts being taught,
          which boosts learning.
        </Typography>
        <div className={classes.heroButtons}>
          <Grid container spacing={2} justify='center'>
            <Grid item>
              <Button variant='contained' color='primary' onClick={() => history.push('/login')}>
                Login and choose workspace
              </Button>
            </Grid>
            <Grid item>
              <Button variant='outlined' color='primary' onClick={navigateToGuestWorkspace}>
              Continue as guest
              </Button>
            </Grid>
          </Grid>
        </div>
      </Container>
    </div>
  )
}

export default withRouter(HomeView)
