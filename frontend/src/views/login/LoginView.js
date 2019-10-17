import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  Container, Button, TextField, Typography, FormHelperText, CircularProgress, Divider
} from '@material-ui/core'
import qs from 'qs'

import { CREATE_GUEST_ACCOUNT, MERGE_USER } from '../../graphql/Mutation'
import Auth from '../../lib/authentication'
import { useLoginStateValue, useMessageStateValue } from '../../store'
import useRouter from '../../useRouter'
import { ReactComponent as HakaIcon } from '../../static/haka.svg'
import { noDefault } from '../../lib/eventMiddleware'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  wrapper: {
    position: 'relative',
    margin: theme.spacing(1, 0),
    '& > .abcRioButton': {
      width: '100% !important'
    }
  },
  form: {
    marginTop: theme.spacing(1)
  },
  signInButton: {
    marginBottom: theme.spacing(0.5)
  },
  guestButton: {
    marginTop: theme.spacing(0.5)
  },
  hakaButton: {
    width: '100%',
    margin: theme.spacing(3, 0),
    display: 'block'
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

const LoginView = () => {
  const classes = useStyles()
  const { history, location } = useRouter()

  const createGuestMutation = useMutation(CREATE_GUEST_ACCOUNT)

  const [, dispatch] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState(false)
  const [loadingTMC, setLoadingTMC] = useState(false)
  const [loadingGuest, setLoadingGuest] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const loading = loadingTMC || loadingGuest || loadingGoogle

  const [googleLoginEnabled, setGoogleLoginEnabled] = useState(Boolean(window._googleAuthEnabled))

  useEffect(() => {
    Auth.GOOGLE.isEnabled().then(setGoogleLoginEnabled)
  }, [])

  const showGuestButton = Boolean(location.state)
  const nextPath = location.state ? location.state.from.pathname : '/'

  const mergeUser = useMutation(MERGE_USER)

  if (location.hash?.length > 1) {
    const data = qs.parse(location.hash.substr(1))
    if (window.localStorage.connectHaka) {
      mergeUser({
        accessToken: data.token
      }).then(() => history.push('/user'))
      return null
    }
    if (data.token) {
      data.type = 'HAKA'
      dispatch({ type: 'login', data })
      history.push(nextPath)
      return null
    }
  }

  const authenticateGoogle = async () => {
    setLoadingGoogle(true)
    try {
      const data = await Auth.GOOGLE.signIn()
      dispatch({ type: 'login', data })
      history.push(nextPath)
    } catch (err) {
      console.error(err)
      messageDispatch({
        type: 'setError',
        data: 'Google login failed'
      })
    }
    setLoadingGoogle(false)
  }

  const authenticate = noDefault(async () => {
    setLoadingTMC(true)
    try {
      const data = await Auth.TMC.signIn({ email, password })
      dispatch({ type: 'login', data })
      history.push(nextPath)
    } catch {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 4000)
    }
    setLoadingTMC(false)
  })

  const createGuestAccount = noDefault(async () => {
    setLoadingGuest(true)
    try {
      const result = await createGuestMutation()
      const data = result.data.createGuest
      data.type = 'GUEST'
      await dispatch({ type: 'login', data })
      history.push(nextPath)
    } catch {
      messageDispatch({ type: 'setError', data: 'Failed to create guest account' })
    }
    setLoadingGuest(false)
  })

  return (
    <Container component='main' maxWidth='xs'>
      {Auth.TMC.isEnabled() && <div className={classes.paper}>
        <Typography component='h1' variant='h5'>
          Sign in with <a href='https://www.mooc.fi/en/sign-up'>mooc.fi account</a>
        </Typography>

        <form
          className={classes.form}
          onSubmit={!loading ? authenticate : () => { }}
          noValidate
        >
          <TextField
            error={error}
            variant='outlined'
            margin='normal'
            required
            fullWidth
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
            autoComplete='current-password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <FormHelperText error={error}>
            {error ? 'Invalid username or password.' : null}
          </FormHelperText>
          <div className={classes.wrapper}>
            <Button
              className={classes.signInButton}
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
            >
              {!loadingTMC ? 'Sign In' : '\u00A0'}
            </Button>
            {loadingTMC && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </form>
      </div>}
      {Auth.HAKA.isEnabled() && <>
        <Divider />
        <div className={classes.wrapper}>
          <a className={classes.hakaButton} href={Auth.HAKA.signInURL}>
            <HakaIcon />
          </a>
        </div>
      </>}
      {googleLoginEnabled && <>
        <Divider />
        <div className={classes.wrapper}>
          <Button
            className={classes.googleButton}
            type='button'
            fullWidth
            variant='contained'
            color='primary'
            onClick={!loading ? authenticateGoogle : () => { }}
          >
            {!loadingGoogle ? 'Sign In with Google' : '\u00A0'}
          </Button>
          {loadingGoogle && <CircularProgress size={24} className={classes.buttonProgress} />}
        </div>
      </>}
      {showGuestButton && <>
        <Divider />
        <div className={classes.wrapper}>
          <Button
            className={classes.guestButton}
            type='button'
            fullWidth
            variant='contained'
            color='primary'
            onClick={!loading ? createGuestAccount : () => { }}
          >
            {!loadingGuest ? 'Continue as guest' : '\u00A0'}
          </Button>
          {loadingGuest && <CircularProgress size={24} className={classes.buttonProgress} />}
        </div>
      </>}
    </Container>
  )
}

export default LoginView
