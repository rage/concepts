import React from 'react'
import { makeStyles } from '@material-ui/core'
import { useQuery } from 'react-apollo-hooks'

import { WORKSPACES_FOR_USER, PROJECTS_FOR_USER } from '../../graphql/Query'
import WorkspaceList  from './WorkspaceList'
import ProjectList from './ProjectList'
import LoadingBar from '../../components/LoadingBar'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gridArea: 'content / content / bottom-navbar / bottom-navbar',
    overflow: 'auto',
    '& > div:not(:first-child)': {
      marginTop: '16px'
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
    <div className={classes.root}>
      <WorkspaceList
        workspaces={workspaceQuery.data.workspacesForUser.map(ws => ws.workspace)}
        urlPrefix='/workspaces' />
      {user.role === 'STAFF' &&
        <ProjectList projects={projectQuery.data.projectsForUser.map(p => p.project)} />}
    </div>
  )
}

export default UserViewContent
