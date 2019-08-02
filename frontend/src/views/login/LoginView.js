import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  Container, Button, TextField, Typography, FormHelperText, CircularProgress, Divider
} from '@material-ui/core'

import {
  CREATE_GUEST_ACCOUNT
} from '../../graphql/Mutation'
import { signIn, isSignedIn } from '../../lib/authentication'
import { useLoginStateValue } from '../../store'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  wrapper: {
    position: 'relative',
    margin: theme.spacing(1, 0)
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  signInButton: {
    marginBottom: theme.spacing(0.5)
  },
  guestButton: {
    marginTop: theme.spacing(0.5)
  },
  buttonProgress: {
    color: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}))

const LoginView = ({ history, location }) => {
  const classes = useStyles()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingGuest, setLoadingGuest] = useState(false)

  const dispatch = useLoginStateValue()[1]
  const showGuestButton = Boolean(location.state)
  const nextPath = location.state ? location.state.from.pathname : '/'

  const authenticate = (event) => {
    event.preventDefault()
    setLoading(true)
    signIn({ email, password }).then(response => dispatch({
      type: 'login',
      data: response.user
    })).catch(() => {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 4000)
    }).finally(() => {
      setLoading(false)
      if (isSignedIn()) {
        history.push(nextPath)
      }
    })
  }

  const createGuestMutation = useMutation(CREATE_GUEST_ACCOUNT)

  const createGuestAccount = async () => {
    const result = await createGuestMutation()
    const userData = result.data.createGuest
    await window.localStorage.setItem('current_user', JSON.stringify(userData))
    await dispatch({
      type: 'login',
      data: userData.user
    })
  }

  const continueAsGuest = evt => {
    evt.preventDefault()
    setLoadingGuest(true)
    createGuestAccount().then(() => {
      setLoadingGuest(false)
      if (isSignedIn()) {
        history.push(nextPath)
      }
    })
  }

  return (
    <Container component='main' maxWidth='xs'>
      <div className={classes.paper}>
        <Typography component='h1' variant='h5'>
          Sign in with TMC account
        </Typography>


        <form
          className={classes.form}
          onSubmit={!loading && !loadingGuest ? authenticate : () => { }}
          noValidate
        >
          <TextField
            error={error}
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='email'
            label='email or username'
            name='email'
            autoComplete='email'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            autoFocus
          />

          <TextField
            error={error}
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='password'
            label='password'
            type='password'
            id='password'
            autoComplete='current-password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <FormHelperText error={error}>
            {
              error ?
                <span>
                  Invalid username or password.
                </span>
                : null
            }
          </FormHelperText>
          <div className={classes.wrapper}>
            <Button
              className={classes.signInButton}
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
            >
              {!loading ? 'Sign In' : '\u00A0'}
            </Button>
            {
              loading && <CircularProgress size={24} className={classes.buttonProgress} />
            }
          </div>
        </form>
      </div>
      {showGuestButton && <>
        <Divider />
        <div className={classes.wrapper}>
          <Button
            className={classes.guestButton}
            type='button'
            fullWidth
            variant='contained'
            color='primary'
            onClick={!loading && !loadingGuest ? continueAsGuest : () => { }}
          >
            {!loadingGuest ? 'Continue as guest' : '\u00A0'}
          </Button>
          {
            loadingGuest && <CircularProgress size={24} className={classes.buttonProgress} />
          }
        </div>
      </>}
    </Container>
  )

}


export default withRouter(LoginView)
