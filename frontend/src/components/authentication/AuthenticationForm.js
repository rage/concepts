import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Container from '@material-ui/core/Container'
import CssBaseline from '@material-ui/core/CssBaseline'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import FormHelperText from '@material-ui/core/FormHelperText'
import CircularProgress from '@material-ui/core/CircularProgress'

import { signIn, isSignedIn } from '../../lib/authentication'
import { withRouter } from 'react-router-dom'

import { useLoginStateValue } from '../../store'

const styles = theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  wrapper: {
    position: 'relative',
    margin: theme.spacing(1)
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  buttonProgress: {
    color: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
})

const AuthenticationForm = ({ history, classes }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const dispatch = useLoginStateValue()[1]

  const authenticate = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await signIn({ email, password })
      dispatch({
        type: 'login',
        data: response.user
      })
    } catch (e) {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 4000)
    }
    setLoading(false)
    if (isSignedIn()) {
      history.push('/user')
    }
  }

  return (
    <Container component='main' maxWidth='xs'>
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component='h1' variant='h5'>
          Sign in with TMC account
        </Typography>


        <form className={classes.form} onSubmit={authenticate} noValidate>
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
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
            >
              Sign In
            </Button>
            {
              loading && <CircularProgress size={24} className={classes.buttonProgress} />
            }
          </div>
        </form>
      </div>

    </Container>
  )

}


export default withRouter(withStyles(styles)(AuthenticationForm))
