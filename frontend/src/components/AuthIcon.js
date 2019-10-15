import React, { useState } from 'react'
import { Button, IconButton, Menu, MenuItem } from '@material-ui/core'
import { AccountCircle } from '@material-ui/icons'

import { signOut } from '../lib/authentication'
import { Role } from '../lib/permissions'
import { useLoginStateValue } from '../store'
import useRouter from '../useRouter'

const AuthenticationIcon = () => {
  const { history } = useRouter()
  const [{ loggedIn, user }, dispatch] = useLoginStateValue()
  const [anchorElement, setAnchorElement] = useState(null)
  const anchorElementOpen = Boolean(anchorElement)

  const handleMenu = (event) => {
    setAnchorElement(event.currentTarget)
  }

  const handleAnchorClose = () => {
    setAnchorElement(null)
  }

  const navigateToLogin = () => {
    history.push('/login')
  }

  const navigateToPorting = () => {
    history.push('/porting')
    handleAnchorClose()
  }

  const logout = async () => {
    await signOut()
    dispatch({
      type: 'logout'
    })
    history.push('/')
    handleAnchorClose()
  }

  return loggedIn ? <>
    <Menu
      anchorEl={anchorElement}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      open={anchorElementOpen}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      onClose={handleAnchorClose}
    >
      <MenuItem>
        Logged in as {user.role === Role.GUEST
          ? 'a guest' : user.username} ({user.role.toLowerCase()})
      </MenuItem>
      {loggedIn && user.role >= Role.STUDENT &&
        <MenuItem onClick={navigateToPorting}>Import data</MenuItem>
      }
      <MenuItem onClick={logout}>Logout</MenuItem>
    </Menu>
  </> : (
    <Button onClick={navigateToLogin} color='inherit'>
      Login
    </Button>
  )
}

export default AuthenticationIcon
