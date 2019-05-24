import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import { Link } from 'react-router-dom'

const styles = {
  root: {
    flexGrow: 1,
    marginBottom: '10px'
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10,
  },
};

const NavBar = ({ classes }) => (
  <div className={classes.root}>
    <AppBar elevation={0} position="static">
      <Toolbar variant="dense">
        <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit">
          <Link style={{ textDecoration: 'none', color: 'inherit' }} to="/">Courses</Link>
        </Typography>
      </Toolbar>
    </AppBar>
  </div>
)

export default withStyles(styles)(NavBar);
