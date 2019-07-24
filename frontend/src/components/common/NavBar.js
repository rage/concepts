import React, { useState } from 'react'
import { Link , withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import { AppBar, Toolbar, Typography, IconButton, Button, MenuItem, Menu } from '@material-ui/core'
import { Menu as MenuIcon, AccountCircle } from '@material-ui/icons'

import { signOut } from '../../lib/authentication'
import { useLoginStateValue } from '../../store'

const useStyles = makeStyles(() => ({
  root: {
    gridArea: 'navbar'
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10
  },
  title: {
    flexGrow: 1
  }
}))

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
    history.push('/auth')
  }

  const navigateToAccount = () => {
    history.push('/user')
    handleAnchorClose()
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

  return loggedIn ? (
    <div>
      <IconButton
        aria-label='Account of current user'
        aria-controls='login-menu'
        aria-haspopup='true'
        onClick={handleMenu}
        color='inherit'
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id='login-menu'
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
        <MenuItem onClick={navigateToAccount}>Workspaces</MenuItem>
        {
          loggedIn && JSON.parse(localStorage.current_user).user.role !== 'GUEST' &&
            <MenuItem onClick={navigateToPorting}>Import data</MenuItem>
        }
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>
    </div>
  ) : (
    <Button onClick={navigateToLogin} color='inherit'>
      Login
    </Button>
  )
})

const NavBar = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <AppBar elevation={0} position='static'>
        <Toolbar variant='dense'>
          <IconButton className={classes.menuButton} color='inherit' aria-label='Menu'>
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} variant='h6' color='inherit'>
            <Link style={{ textDecoration: 'none', color: 'inherit' }} to='/'>Home</Link>
          </Typography>
          <AuthenticationIcon />
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default NavBar
