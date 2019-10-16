import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, CircularProgress, Container, Typography } from '@material-ui/core'

import { useLoginStateValue } from '../../store'
import { HAKA_URL, signOut } from '../../lib/authentication'
import useRouter from '../../useRouter'

const useStyles = makeStyles({
  root: {
    '& > *': {
      margin: '16px 0'
    }
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
  tmcInfo: {
    marginTop: '8px'
  }
})

const fancyTypeName = {
  TMC: (name, role) => `${name} on mooc.fi (role: ${role.toLowerCase()})`,
  GOOGLE: (name, role) => `${name} on Google (role: ${role.toLowerCase()})`,
  HAKA: (name, role) => `${name} through Haka (role: ${role.toLowerCase()})`,
  GUEST: () => 'a guest'
}

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

const JSONValue = ({ value }) => {
  if (value === null) {
    return 'null'
  } else if (typeof value === 'object') {
    return <JSONObject data={value} />
  }
  return JSON.stringify(value) || null
}

const JSONObject = ({ data, className }) => {
  if (!data) {
    return null
  }
  return <table className={className}>
    <tbody>
      {Object.entries(data).map(([key, value]) => <tr>
        <th>"{key}":</th>
        <td><JSONValue value={value} /></td>
      </tr>)}
    </tbody>
  </table>
}

const UserView = () => {
  const classes = useStyles()
  const { history } = useRouter()

  const [data, dispatch] = useLoginStateValue()
  const [loading, setLoading] = useState(null)
  const tmcData = JSON.parse(window.localStorage['tmc.user'] || 'null')

  const logout = async () => {
    await signOut()
    dispatch({
      type: 'logout'
    })
    history.push('/')
  }

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account?')) {
      return
    }
    window.alert('Not yet implemented')
  }

  const connectTMC = async () => {
    setLoading('tmc')

  }

  const connectHaka = async () => {
    setLoading('haka')

  }

  const connectGoogle = async () => {
    setLoading('google')

  }

  return <Container className={classes.root} component='main' maxWidth='sm'>
    <Typography variant='h6' component='h6'>
      Currently signed in
      as {fancyTypeName[data.type](data.displayname, data.user.role)}
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
        <tr>
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
        </tr>
        {HAKA_URL && <tr>
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
        <tr>
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
        </tr>
      </tbody>
    </table>
    <details className={classes.internalInfo}>
      <summary>Internal user info</summary>
      <JSONObject className={classes.jsonObject} data={data} />

      {tmcData && <details className={classes.tmcInfo}>
        <summary>TMC user info</summary>
        <JSONObject className={classes.jsonObject} data={tmcData} />
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
  </Container>
}

export default UserView
