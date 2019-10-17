import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, CircularProgress, Typography } from '@material-ui/core'
import { useMutation } from 'react-apollo-hooks'

import { useLoginStateValue, useMessageStateValue } from '../../store'
import { Role } from '../../lib/permissions'
import Auth from '../../lib/authentication'
import useRouter from '../../useRouter'
import { DISCONNECT_AUTH, MERGE_USER } from '../../graphql/Mutation'
import { PROJECTS_FOR_USER, WORKSPACES_FOR_USER } from '../../graphql/Query'
import { useLoginDialog } from '../../dialogs/authentication'

const useStyles = makeStyles({
  wrapper: {
    width: '100%',
    overflowY: 'auto'
  },
  root: {
    '& > *': {
      margin: '16px 0'
    },
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto',
    '@media screen and (max-width: 732px)': {
      width: 'calc(100% - 32px)'
    },
    overflowY: 'auto'
  },
  connectionTable: {
    width: '100%',
    '& > thead > tr, & > tbody > tr:not(:last-of-type)': {
      '& td, & th': {
        borderBottom: '1px solid black'
      }
    },
    '& td, th': {
      padding: '0 4px'
    },
    '& tr': {
      height: '48px'
    }
  },
  jsonObject: {
    fontFamily: 'monospace',
    '& td': {
      wordBreak: 'break-all'
    },
    '& th, & td': {
      verticalAlign: 'top',
      textAlign: 'left'
    }
  },
  extraInternalinfo: {
    marginTop: '8px'
  },
  buttonWrapper: {
    position: 'relative'
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

const ConnectButton = ({ disabled, loading, onClick, connected }) => {
  const classes = useStyles()
  return (
    <div className={classes.buttonWrapper}>
      <Button
        type='button'
        fullWidth
        variant='contained'
        color={connected ? 'secondary' : 'primary'}
        className={classes.button}
        onClick={!disabled ? onClick : () => { }}
      >
        {!loading
          ? connected ? 'Disconnect' : 'Connect'
          : '\u00A0'}
      </Button>
      {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
    </div>
  )
}

const JSONObject = ({ data, className }) => (
  <table className={className}>
    <tbody>
      {Object.entries(data).map(([key, value]) => typeof value !== 'function' && (
        <tr key={key}>
          <th nowrap='true'>"{key}":</th>
          <td>
            {value !== null && typeof value === 'object'
              ? <JSONObject data={value} />
              : JSON.stringify(value)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const UserView = () => {
  const classes = useStyles()
  const { history } = useRouter()

  const [data, dispatch] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const openLoginDialog = useLoginDialog()

  const [loading, setLoading] = useState(null)

  const disconnectAuth = useMutation(DISCONNECT_AUTH)
  const mergeUser = useMutation(MERGE_USER, {
    refetchQueries: data.user.role >= Role.STAFF ? [
      { query: WORKSPACES_FOR_USER },
      { query: PROJECTS_FOR_USER }
    ] : [{ query: WORKSPACES_FOR_USER }]
  })

  const [googleLoginEnabled, setGoogleLoginEnabled] = useState(Boolean(window._googleAuthEnabled))

  useEffect(() => {
    Auth.GOOGLE.isEnabled().then(setGoogleLoginEnabled)
  }, [])

  const tmcData = JSON.parse(window.localStorage['tmc.user'] || 'null')
  const googleData = JSON.parse(window.localStorage['google.user'] || 'null')

  const logout = async () => {
    await Auth.signOut()
    dispatch({ type: 'logout' })
    history.push('/')
  }

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account?')) {
      return
    }
    window.alert('Not yet implemented')
  }

  const connectToken = async (accessToken, type, displayname) => {
    try {
      const resp = await mergeUser({
        variables: { accessToken }
      })
      dispatch({
        type: 'update',
        user: resp.data.mergeUser
      })
      messageDispatch({
        type: 'setNotification',
        data: `Successfully connected ${type.name} account ${displayname}`
      })
    } catch (err) {
      console.error(err)
      messageDispatch({
        type: 'setError',
        data: `Failed to connected ${type.name} account ${displayname}`
      })
    }
  }

  const disconnect = async (type) => {
    try {
      const resp = await disconnectAuth({
        variables: { authType: type.id }
      })
      dispatch({
        type: 'update',
        user: resp.data.disconnectAuth
      })
      messageDispatch({
        type: 'setNotification',
        data: `Successfully disconnected ${type.name} from your Concepts account`
      })
    } catch (err) {
      console.error(err)
      messageDispatch({
        type: 'setError',
        data: `Failed to disconnect ${type.name}`
      })
    }
  }

  const connectTMC = async () => {
    setLoading('tmc')
    if (data.user.tmcId) {
      await disconnect(Auth.TMC)
    } else {
      let credentials
      try {
        credentials = await openLoginDialog()
      } catch (err) {
        setLoading(null)
        return
      }
      const data = await Auth.TMC.signIn(credentials)
      await connectToken(data.token, Auth.TMC, data.displayname)
    }
    setLoading(null)
  }

  const connectHaka = async () => {
    if (data.user.hakaId) {
      setLoading('haka')
      await disconnect(Auth.HAKA)
      setLoading(null)
    } else {
      window.localStorage.connectHaka = true
      Auth.HAKA.signIn()
    }
  }

  const connectGoogle = async () => {
    setLoading('google')
    if (data.user.googleId) {
      await disconnect(Auth.GOOGLE)
    } else {
      const data = await Auth.GOOGLE.signIn()
      await connectToken(data.token, Auth.GOOGLE, data.displayname)
    }
    setLoading(null)
  }

  return <div className={classes.wrapper}>
    <main className={classes.root}>
      <Typography variant='h6' component='h6'>
        Currently signed in as {data.type === Auth.GUEST ? 'a guest'
          : `${data.displayname} on ${data.type.name} (role: ${data.user.role})`}
      </Typography>

      <table className={classes.connectionTable} cellSpacing={0}>
        <thead>
          <tr>
            <th>Service</th>
            <th>Account ID</th>
            <th>Connect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Concepts</th>
            <td>{data.user.id}</td>
            <td>N/A</td>
          </tr>
          {Auth.TMC.isEnabled() && <tr>
            <th>mooc.fi</th>
            <td>{data.user.tmcId || 'Not connected'}</td>
            <td>
              <ConnectButton
                disabled={Boolean(loading)}
                loading={loading === 'tmc'}
                connected={Boolean(data.user.tmcId)}
                onClick={connectTMC}
              />
            </td>
          </tr>}
          {Auth.HAKA.isEnabled() && <tr>
            <th>Haka</th>
            <td>{data.user.hakaId || 'Not connected'}</td>
            <td>
              <ConnectButton
                disabled={Boolean(loading)}
                loading={loading === 'haka'}
                connected={Boolean(data.user.hakaId)}
                onClick={connectHaka}
              />
            </td>
          </tr>}
          {googleLoginEnabled && <tr>
            <th>Google</th>
            <td>{data.user.googleId || 'Not connected'}</td>
            <td>
              <ConnectButton
                disabled={Boolean(loading)}
                loading={loading === 'google'}
                connected={Boolean(data.user.googleId)}
                onClick={connectGoogle}
              />
            </td>
          </tr>}
        </tbody>
      </table>
      <details className={classes.internalInfo}>
        <summary>Internal user info</summary>
        <p>
          Only the data in the <code>user</code> object is stored on the server,
          the rest (including your displayname) is only stored in your browser.
        </p>

        <JSONObject className={classes.jsonObject} data={data} />

        {tmcData && <details className={classes.extraInternalinfo}>
          <summary>TMC user info</summary>
          <JSONObject className={classes.jsonObject} data={tmcData} />
        </details>}
        {googleData && <details className={classes.extraInternalinfo}>
          <summary>Google user info</summary>
          <JSONObject className={classes.jsonObject} data={googleData} />
        </details>}
      </details>

      <Button
        fullWidth variant='contained' color='primary'
        className={classes.logoutButton} onClick={logout}
      >
        Log out
      </Button>
      <Button
        fullWidth variant='contained' color='secondary'
        className={classes.deleteAccountButton} onClick={deleteAccount}
      >
        Delete account
      </Button>
    </main>
  </div>
}

export default UserView
