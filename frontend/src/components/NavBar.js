import React, { useRef } from 'react'
import { useQuery } from 'react-apollo-hooks'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link as MaterialLink,
  CircularProgress
} from '@material-ui/core'
import { NavigateNext as NavigateNextIcon } from '@material-ui/icons'

import AuthenticationIcon from './AuthIcon'
import { PROJECT_BY_ID, WORKSPACE_BY_ID, COURSE_BY_ID } from '../graphql/Query'
import { useLoginStateValue } from '../store'

const Link = props => <MaterialLink {...props} component={RouterLink} />

const useStyles = makeStyles(() => ({
  root: {
    gridArea: 'navbar'
  },
  breadcrumbs: {
    flexGrow: 1,
    color: 'inherit'
  },
  savingIndicator: {
    fontSize: '.6em',
    color: 'rgba(255, 255, 255, 0.6)',
    '&:not(.logged-in)': {
      display: 'none'
    }
  }
}))

const parseWorkspacePath = (workspaceId, path, prefix) => {
  if (path.length === 0) {
    return []
  }
  switch (path[0]) {
  case 'mapper':
    return [{
      name: 'Mapper',
      courseId: path[1],
      link: `${prefix}/mapper/${path[1]}`
    }]
  case 'heatmap':
    return [{
      name: 'Heatmap',
      link: `${prefix}/heatmap`
    }]
  case 'graph':
    return [{
      name: 'Graph',
      link: `${prefix}/graph`
    }]
  default:
    return []
  }
}

const parseProjectPath = (projectId, path, prefix) => {
  switch (path[0]) {
  case 'clone':
    return [{
      name: 'Clone',
      link: `${prefix}/clone`
    }]
  case 'workspaces': {
    const link = `${prefix}/workspaces/${path[1]}`
    return [{
      name: 'Workspace',
      workspaceId: path[1],
      link
    }, ...parseWorkspacePath(path[1], path.slice(2), link)]
  } default:
    return []
  }
}

const parsePath = (path) => {
  switch (path[0]) {
  case '':
    return parsePath(path.slice(1))
  case 'porting':
    return [{ name: 'Import data' }]
  case 'login':
    return [{ name: 'Log in' }]
  case 'user':
    return [{ name: 'User' }]
  case 'projects': {
    const link = `/projects/${path[1]}`
    return [{
      name: 'Project',
      projectId: path[1],
      link
    }, ...parseProjectPath(path[1], path.slice(2), link)]
  } case 'workspaces': {
    const link = `/workspaces/${path[1]}`
    return [{
      name: 'Workspace',
      workspaceId: path[1],
      link
    }, ...parseWorkspacePath(path[1], path.slice(2), link)]
  } case 'join': {
    const token = path[1]
    return [{
      name: `Join ${token[0] === 'w' ? 'workspace' : 'project'}`,
      token,
      link: `/join/${token}`
    }]
  }
  default:
    return []
  }
}

const parseLocation = location => ([
  { name: 'Home', link: '/' },
  ...parsePath(location.pathname.split('/'))
])

const pathItemId = item => item.link || item.courseId || item.name

const NavBar = ({ location }) => {
  const [{ loggedIn, user }] = useLoginStateValue()
  const prevLocation = useRef(location.pathname)
  const prevPath = useRef([])
  const undo = useRef([])

  const updateHistory = newPath => {
    const newUndo = [...prevPath.current, ...undo.current]
    if (newPath.length >= newUndo.length) {
      undo.current = []
      return
    }
    for (let i = 0; i < newPath.length; i++) {
      if (pathItemId(newUndo[0]) !== pathItemId(newPath[i])) {
        undo.current = []
        return
      }
      newUndo.shift()
    }
    undo.current = newUndo
    undo.current.forEach(node => node.historical = true)
  }

  const path = parseLocation(location)
  if (prevLocation.current !== location.pathname) {
    updateHistory(path)
  }
  prevLocation.current = location.pathname
  prevPath.current = path
  const { workspaceId, projectId, courseId } = Object.assign({}, ...path)

  const projectQuery = useQuery(PROJECT_BY_ID, {
    skip: !loggedIn || user.role !== 'STAFF' || !projectId,
    variables: {
      id: projectId
    }
  })
  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    skip: !loggedIn || !workspaceId,
    variables: {
      id: workspaceId
    }
  })
  const courseQuery = useQuery(COURSE_BY_ID, {
    skip: !loggedIn || !courseId,
    variables: {
      id: courseId
    }
  })

  const loading = <CircularProgress style={{ display: 'flex' }} color='inherit' size={24} />
  const getBreadcrumb = name => path.find(p => p.name === name)

  if (projectQuery.data) {
    getBreadcrumb('Project').name =
      projectQuery.loading ? loading : projectQuery.data.projectById.name
  }
  if (workspaceQuery.data) {
    getBreadcrumb('Workspace').name =
      workspaceQuery.loading ? loading : workspaceQuery.data.workspaceById.name
  }
  if (courseQuery.data) {
    getBreadcrumb('Mapper').name =
      courseQuery.loading ? loading : courseQuery.data.courseById.name
  }

  const classes = useStyles()
  return (
    <div className={classes.root}>
      <AppBar elevation={0} position='static'>
        <Toolbar variant='dense'>
          <Breadcrumbs
            separator={<NavigateNextIcon />}
            className={classes.breadcrumbs}
          >
            {[...path, ...undo.current].map(item => {
              let content = item.name
              if (item.link) {
                content = (
                  <Link style={{ textDecoration: 'none' }} to={item.link} color='inherit'>
                    {content}
                  </Link>
                )
              }
              return (
                <Typography
                  key={item.name} variant='h6' color={item.historical ? 'textSecondary' : 'inherit'}
                >
                  {content}
                </Typography>
              )
            })}
          </Breadcrumbs>
          <div
            id='saving-indicator'
            className={`${classes.savingIndicator} ${loggedIn ? 'logged-in' : ''}`} />
          <AuthenticationIcon />
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default NavBar
