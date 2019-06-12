import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import { Link } from 'react-router-dom'

// Authentication related imporst
import Button from '@material-ui/core/Button'
import { signOut } from '../../lib/authentication'
import { withRouter } from 'react-router-dom'

import { useLoginStateValue } from '../../store'

const styles = {
  root: {
    flexGrow: 1,
    marginBottom: '10px'
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10,
  },
  title: {
    flexGrow: 1
  }
};

const NavBar = ({ history, classes }) => {
  const [{ loggedIn }, dispatch] = useLoginStateValue()

  const navigateToLogin = () => {
    history.push("/auth")
  }

  const logout = async () => {
    await signOut()
    dispatch({
      type: 'logout'
    })
    history.push("/")
  }

  return (
    <div className={classes.root}>
      <AppBar elevation={0} position="static" >
        <Toolbar variant="dense">
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} variant="h6" color="inherit">
            <Link style={{ textDecoration: 'none', color: 'inherit' }} to="/">Courses</Link>
          </Typography>
          {loggedIn ? (
            <Button onClick={logout} color="inherit">
              Logout
                </Button>
          ) : (<Button onClick={navigateToLogin} color="inherit">
            Login
                </Button>)}
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default withRouter(withStyles(styles)(NavBar));
