import React from 'react'
import { makeStyles } from '@material-ui/core'
import { useQuery } from 'react-apollo-hooks'

import { WORKSPACES_FOR_USER, PROJECTS_FOR_USER } from '../../graphql/Query'
import WorkspaceList  from './WorkspaceList'
import ProjectList from './ProjectList'
import LoadingBar from '../../components/LoadingBar'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    gridTemplate: `"workspaces gap  projects" 1fr
                  / 1fr        16px 1fr`,
    width: '1440px',
    '@media screen and (max-width: 1472px)': {
      width: 'calc(100% - 32px)'
    },
    gridArea: 'content / content / bottom-navbar / bottom-navbar',
    overflow: 'hidden',
    margin: '6px auto 16px',
    '&:not(.staff)': {
      gridTemplateColumns: '1fr 0 0',
      width: '720px',
      '@media screen and (max-width: 752px)': {
        width: 'calc(100% - 32px)'
      }
    }
  }
}))

const UserViewContent = ({ user }) => {
  const workspaceQuery = useQuery(WORKSPACES_FOR_USER)

  const projectQuery = useQuery(PROJECTS_FOR_USER, {
    skip: user.role !== 'STAFF'
  })

  const classes = useStyles()

  if (!workspaceQuery.data.workspacesForUser ||
      (user.role === 'STAFF' && !projectQuery.data.projectsForUser)) {
    return <LoadingBar id='main-view' />
  }

  return (
    <div className={`${classes.root} ${user.role.toLowerCase()}`}>
      <WorkspaceList
        workspaces={workspaceQuery.data.workspacesForUser.map(ws => ws.workspace)}
        urlPrefix='/workspaces' />
      {user.role === 'STAFF' &&
        <ProjectList projects={projectQuery.data.projectsForUser.map(p => p.project)} />}
    </div>
  )
}

export default UserViewContent
