import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Container from '@material-ui/core/Container'
import CssBaseline from '@material-ui/core/CssBaseline'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import FormHelperText from '@material-ui/core/FormHelperText'

import { signIn, isSignedIn } from '../../lib/authentication'
import { withRouter } from 'react-router-dom'

import { useLoginStateValue } from '../../store'

const styles = theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
})

const AuthenticationForm = ({ history, classes }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState(false)

  const dispatch = useLoginStateValue()[1]

  const authenticate = async (event) => {
    event.preventDefault();
    try {
      await signIn({ email, password })
      dispatch({
        type: 'login'
      })
    } catch (e) {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 4000)
    }
    if (isSignedIn()) {
      history.push("/")
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Sign in with TMC account
        </Typography>


        <form className={classes.form} onSubmit={authenticate} noValidate>
          <TextField
            error={error}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="email or username"
            name="email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            autoFocus
          />

          <TextField
            error={error}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="password"
            type="password"
            id="password"
            autoComplete="current-password"
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
        </form>
      </div>

    </Container>
  )

}


export default withRouter(withStyles(styles)(AuthenticationForm))