import React  from 'react'
import { useQuery } from 'react-apollo-hooks'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, Typography, Breadcrumbs, Link as MaterialLink } from '@material-ui/core'
import { NavigateNext as NavigateNextIcon } from '@material-ui/icons'

import AuthenticationIcon from './AuthIcon'
import { PROJECTS_FOR_USER, WORKSPACES_FOR_USER } from '../../graphql/Query'
import { useLoginStateValue } from '../../store'

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

const parseWorkspacePath = (workspaceId, path, meta) => {
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

const parseProjectPath = (projectId, path, meta) => {
  if (path.length === 0) {
    return []
  }
  switch (path[0]) {
  case 'clone':
    return [{ name: 'Clone' }]
  case 'workspaces':
    return [{
      name: (meta.workspaces[path[1]] || {}).name || 'Workspace',
      id: path[1],
      link: `/projects/${projectId}/workspaces/${path[1]}`
    }].concat(parseWorkspacePath(path[1], path.slice(2), meta))
  }
}

const parsePath = (path, meta) => {
  if (path.length === 0) {
    return []
  }
  switch (path[0]) {
  case '':
    return parsePath(path.slice(1), meta)
  case 'porting':
    return [{ name: 'Import data' }]
  case 'auth':
    return [{ name: 'Log in' }]
  case 'user':
    return [{ name: 'User' }]
  case 'projects':
    return [
      { name: 'User', link: '/user' },
      {
        name: (meta.projects[path[1]] || {}).name || 'Project',
        id: path[1],
        link: `/projects/${path[1]}`
      }
    ].concat(parseProjectPath(path[1], path.slice(2), meta))
  case 'workspaces':
    return [
      { name: 'User', link: '/user' },
      {
        name: (meta.workspaces[path[1]] || {}).name || 'Workspace',
        id: path[1],
        link: `/workspaces/${path[1]}`
      }
    ].concat(parseWorkspacePath(path[1], path.slice(2), meta))

  case 'join': {
    const token = path[1]
    const type = token[0] === 'w' ? 'workspace' : 'project'
    return [{ name: `Join ${type}`, link: `/join/${token}` }]
  }
  }
  return []
}

const NavBar = ({ location }) => {
  const [{ loggedIn, user }] = useLoginStateValue()

  const workspaceQuery = useQuery(WORKSPACES_FOR_USER, {
    skip: !loggedIn
  })
  const workspaces = workspaceQuery.data && workspaceQuery.data.workspacesForUser
    ? Object.fromEntries(workspaceQuery.data.workspacesForUser
      .map(ws => [ws.workspace.id, ws.workspace]))
    : {}
  const projectQuery = useQuery(PROJECTS_FOR_USER, {
    skip: !loggedIn || user.role !== 'STAFF'
  })
  const projects = projectQuery.data && projectQuery.data.projectsForUser
    ? Object.fromEntries(projectQuery.data.projectsForUser.map(p => [p.project.id, p.project]))
    : {}
  const meta = { workspaces, projects }

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
            {parsePath(path, meta).map(item => {
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
