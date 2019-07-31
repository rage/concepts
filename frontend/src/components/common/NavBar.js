import React  from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, Typography, Breadcrumbs, Link as MaterialLink } from '@material-ui/core'
import { NavigateNext as NavigateNextIcon } from '@material-ui/icons'

import AuthenticationIcon from './AuthIcon'

const Link = props => <MaterialLink {...props} component={RouterLink} />

const useStyles = makeStyles(() => ({
  root: {
    gridArea: 'navbar'
  },
  breadcrumbs: {
    flexGrow: 1,
    color: 'inherit'
  }
}))

const parseWorkspacePath = (workspaceId, path) => {
  if (path.length === 0) {
    return []
  }
  switch (path[0]) {
  case 'mapper':
    return [{ name: 'Mapper', id: path[1] }]
  case 'heatmap':
    return [{ name: 'Heatmap' }]
  case 'graph':
    return [{ name: 'Graph' }]
  }
  return []
}

const parseProjectPath = (projectId, path) => {
  if (path.length === 0) {
    return []
  }
  switch (path[0]) {
  case 'clone':
    return [{ name: 'Clone' }]
  case 'workspaces':
    return [
      { name: 'Workspace', id: path[1],link: `/projects/${projectId}/workspaces/${path[1]}` }
    ].concat(parseWorkspacePath(path[1], path.slice(2)))
  }
}

const parsePath = path => {
  if (path.length === 0) {
    return []
  }
  switch (path[0]) {
  case '':
    return parsePath(path.slice(1))
  case 'porting':
    return [{ name: 'Import data' }]
  case 'auth':
    return [{ name: 'Log in' }]
  case 'user':
    return [{ name: 'User' }]
  case 'projects':
    return [
      { name: 'User', link: '/user' },
      { name: 'Project', id: path[1], link: `/projects/${path[1]}` }
    ].concat(parseProjectPath(path[1], path.slice(2)))
  case 'workspaces':
    return [
      { name: 'User', link: '/user' },
      { name: 'Workspace', id: path[1], link: `/workspaces/${path[1]}` }
    ].concat(parseWorkspacePath(path[1], path.slice(2)))

  case 'join': {
    const token = path[1]
    const type = token[0] === 'w' ? 'workspace' : 'project'
    return [{ name: `Join ${type}`, link: `/join/${token}` }]
  }
  }
  return []
}

const NavBar = ({ location }) => {
  const path = location.pathname.split('/')
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <AppBar elevation={0} position='static'>
        <Toolbar variant='dense'>
          <Breadcrumbs
            separator={<NavigateNextIcon />}
            className={classes.breadcrumbs}
          >
            <Typography variant='h6' color='inherit'>
              <Link style={{ textDecoration: 'none', color: 'inherit' }} to='/'>
                Home
              </Link>
            </Typography>
            {parsePath(path).map(item => {
              let content = item.name
              if (item.link) {
                content = (
                  <Link style={{ textDecoration: 'none', color: 'inherit' }} to={item.link}>
                    {content}
                  </Link>
                )
              }
              return (
                <Typography key={item.name} variant='h6' color='inherit'>{content}</Typography>
              )
            })}
          </Breadcrumbs>
          <AuthenticationIcon />
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default NavBar
