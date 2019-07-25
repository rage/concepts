import React from 'react'

import { CircularProgress, makeStyles } from '@material-ui/core'

import { useQuery, useMutation } from 'react-apollo-hooks'
import {
  CREATE_WORKSPACE,
  DELETE_WORKSPACE,
  UPDATE_WORKSPACE,
  CREATE_SHARE_LINK,
  DELETE_SHARE_LINK,
  CREATE_PROJECT,
  DELETE_PROJECT,
  UPDATE_PROJECT
} from '../../graphql/Mutation'

import { WORKSPACES_FOR_USER, PROJECTS_FOR_USER } from '../../graphql/Query'

import WorkspaceList from '../workspace/WorkspaceList'
import ProjectList from '../project/ProjectList'

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

const StaffView = () => {
  const workspaceQuery = useQuery(WORKSPACES_FOR_USER)

  const projectQuery = useQuery(PROJECTS_FOR_USER)

  const createWorkspace = useMutation(CREATE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACES_FOR_USER
    }]
  })

  const deleteWorkspace = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACES_FOR_USER
    }]
  })

  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACES_FOR_USER
    }]
  })

  const createShareLink = useMutation(CREATE_SHARE_LINK, {
    refetchQueries: [{
      query: WORKSPACES_FOR_USER
    }]
  })

  const deleteShareLink = useMutation(DELETE_SHARE_LINK)

  const createProject = useMutation(CREATE_PROJECT, {
    refetchQueries: [{
      query: PROJECTS_FOR_USER
    }]
  })

  const deleteProject = useMutation(DELETE_PROJECT, {
    refetchQueries: [{
      query: PROJECTS_FOR_USER
    }]
  })

  const updateProject = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{
      query: PROJECTS_FOR_USER
    }]
  })

  const classes = useStyles()

  return (
    workspaceQuery.data.workspacesForUser && projectQuery.data.projectsForUser ?
      <div className={classes.root}>
        <WorkspaceList
          workspaces={workspaceQuery.data.workspacesForUser.map(ws => ws.workspace)}
          updateWorkspace={updateWorkspace}
          createWorkspace={createWorkspace}
          deleteWorkspace={deleteWorkspace}
          createShareLink={createShareLink}
          deleteShareLink={deleteShareLink}
        />
        <ProjectList
          projects={projectQuery.data.projectsForUser.map(p => p.project)}
          updateProject={updateProject}
          createProject={createProject}
          deleteProject={deleteProject}
        />
      </div>
      :
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
  )
}

export default StaffView
