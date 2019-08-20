import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Button, IconButton, Menu, MenuItem } from '@material-ui/core'
import { AccountCircle } from '@material-ui/icons'

import { signOut } from '../lib/authentication'
import { useLoginStateValue } from '../store'

const AuthenticationIcon = withRouter(({ history }) => {
  const [{ loggedIn }, dispatch] = useLoginStateValue()
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
    <IconButton
      aria-label='Account of current user'
      aria-haspopup='true'
      onClick={handleMenu}
      color='inherit'
    >
      <AccountCircle />
    </IconButton>
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
      {
        loggedIn && JSON.parse(localStorage.current_user).user.role !== 'GUEST' &&
        <MenuItem onClick={navigateToPorting}>Import data</MenuItem>
      }
      <MenuItem onClick={logout}>Logout</MenuItem>
    </Menu>
  </> : (
    <Button onClick={navigateToLogin} color='inherit'>
      Login
    </Button>
  )
})

export default AuthenticationIcon
