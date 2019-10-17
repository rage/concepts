import React, { useRef, useState } from 'react'
import { useQuery } from 'react-apollo-hooks'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link as MaterialLink,
  CircularProgress,
  LinearProgress,
  IconButton
} from '@material-ui/core'
import { AccountCircle, NavigateNext as NavigateNextIcon } from '@material-ui/icons'

import { savingIndicator } from '../apollo/apolloClient'
import { Role } from '../lib/permissions'
import { PROJECT_BY_ID, WORKSPACE_BY_ID, COURSE_BY_ID } from '../graphql/Query'
import { useLoginStateValue } from '../store'
import useRouter from '../useRouter'
import { useLoadingBar } from './LoadingBar'

const Link = props => <MaterialLink {...props} component={RouterLink} />

const useStyles = makeStyles(() => ({
  root: {
    gridArea: 'navbar',
    zIndex: 2
  },
  breadcrumbs: {
    flexGrow: 1,
    color: 'inherit'
  },
  savingIndicator: {
    fontSize: '.6em',
    color: 'rgba(255, 255, 255, 0.6)',
    '&:not($loggedIn)': {
      display: 'none'
    }
  },
  loggedIn: {}
}))

const parseWorkspacePath = (workspaceId, path, prefix) => {
  switch (path?.[0]) {
  case 'mapper':
    return [{
      type: 'course',
      name: 'Mapper',
      courseId: path[1],
      link: `${prefix}/mapper/${path[1]}`
    }]
  case 'manager':
    return [{
      name: 'Manager',
      link: `${prefix}/manager`
    }]
  case 'members':
    return [{
      name: 'Members',
      link: `${prefix}/members`
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
  switch (path?.[0]) {
  case 'overview':
    return [{
      name: 'Overview',
      link: `${prefix}/overview`
    }]
  case 'points':
    return [{
      name: 'Point Groups',
      link: `${prefix}/points`
    }]
  case 'members':
    return [{
      name: 'Members',
      link: `${prefix}/members`
    }]
  case 'clone':
    return [{
      name: 'Clone',
      link: `${prefix}/clone`
    }]
  case 'workspaces': {
    const link = `${prefix}/workspaces/${path[1]}`
    return [{
      type: 'workspace',
      name: 'User Workspace',
      workspaceId: path[1],
      link
    }, ...parseWorkspacePath(path[1], path.slice(2), link)]
  } case 'templates': {
    const link = `${prefix}/templates/${path[1]}`
    return [{
      type: 'workspace',
      name: 'Template',
      workspaceId: path[1],
      link
    }, ...parseWorkspacePath(path[1], path.slice(2), link)]
  } case 'merges': {
    const link = `${prefix}/merges/${path[1]}`
    return [{
      type: 'workspace',
      name: 'Merge',
      workspaceId: path[1],
      link
    }, ...parseWorkspacePath(path[1], path.slice(2), link)]
  } default:
    return []
  }
}

const parsePath = (path) => {
  switch (path?.[0]) {
  case '':
    return parsePath(path.slice(1))
  case 'login':
    return [{ name: 'Log in' }]
  case 'user':
    return [{ name: 'User' }]
  case 'projects': {
    const link = `/projects/${path[1]}`
    return [{
      type: 'project',
      name: 'Project',
      projectId: path[1],
      link
    }, ...parseProjectPath(path[1], path.slice(2), link)]
  } case 'workspaces': {
    const link = `/workspaces/${path[1]}`
    return [{
      type: 'workspace',
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

const parseLocation = location => [
  { name: 'Home', link: '/' },
  ...parsePath(location.pathname.split('/'))
]

const pathItemId = item => item.link || item.name

const NavBar = ({ location }) => {
  const [{ loggedIn, user }] = useLoginStateValue()
  const [loading, setLoading] = useState(null)
  const { history } = useRouter()
  const loadingCache = useRef(new Set())
  const prevLocation = useRef(location.pathname)
  const prevPath = useRef([])
  const undo = useRef([])

  const { setProvider } = useLoadingBar()
  setProvider({
    startLoading: id => {
      if (!loading && !loadingCache.current.has(id)) {
        setLoading(true)
      }
      loadingCache.current.add(id)
    },
    stopLoading: id => {
      if (loadingCache.current.delete(id) && loadingCache.current.size === 0) {
        setLoading(false)
      }
    }
  })

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
    skip: !loggedIn || user.role < Role.STAFF || !projectId,
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

  const breadcrumbLoadingSpinner = <div style={{ display: 'flex' }}>
    <CircularProgress color='inherit' size={24} />
  </div>
  const getBreadcrumb = type => path.find(p => p.type === type)

  if (projectQuery.data) {
    getBreadcrumb('project').name = projectQuery.error
      ? 'Project not found'
      : projectQuery.loading || !projectQuery.data.projectById
        ? breadcrumbLoadingSpinner
        : `Project: ${projectQuery.data.projectById.name}`
  }
  if (workspaceQuery.data) {
    const ws = getBreadcrumb('workspace')
    ws.name = workspaceQuery.error
      ? `${ws.name} not found`
      : workspaceQuery.loading && !workspaceQuery.data.workspaceById
        ? breadcrumbLoadingSpinner
        : `${ws.name}: ${workspaceQuery.data.workspaceById.name}`
  }
  if (courseQuery.data) {
    getBreadcrumb('course').name = courseQuery.error
      ? 'Course not found'
      : courseQuery.loading || !courseQuery.data.courseById
        ? breadcrumbLoadingSpinner
        : `Course: ${courseQuery.data.courseById.name}`
  }

  const classes = useStyles()
  return (
    <nav className={classes.root}>
      <AppBar elevation={0} position='static'>
        <Toolbar variant='dense'>
          <style>{`
.navbar-breadcrumb-separator {
  color: inherit
}
.navbar-breadcrumbs
    > ol
    > .MuiBreadcrumbs-separator:nth-of-type(n+${path.length * 2}):nth-of-type(even) {
  color: rgba(255, 255, 255, .25)
}`
          }</style>
          <Breadcrumbs
            separator={<NavigateNextIcon className='navbar-breadcrumb-separator' />}
            className={`${classes.breadcrumbs} navbar-breadcrumbs`}
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
                  key={item.name} variant='h6' style={{
                    textOverflow: 'ellipsis',
                    maxWidth: '20vw',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    color: item.historical ? 'rgba(255, 255, 255, .25)' : 'inherit'
                  }}
                >
                  {content}
                </Typography>
              )
            })}
          </Breadcrumbs>
          <div
            ref={savingIndicator}
            className={`${classes.savingIndicator} ${loggedIn ? classes.loggedIn : ''}`} />

          {loggedIn && <IconButton
            aria-label='Account of current user'
            aria-haspopup='true'
            onClick={() => history.push('/user')}
            color='inherit'
          >
            <AccountCircle />
          </IconButton>}
        </Toolbar>
      </AppBar>
      {loading && <LinearProgress color='secondary' />}
    </nav>
  )
}

export default NavBar
