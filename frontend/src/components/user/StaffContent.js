import React from 'react'

import { CircularProgress, makeStyles } from '@material-ui/core'

import { useQuery, useMutation } from 'react-apollo-hooks'
import {
  CREATE_WORKSPACE,
  DELETE_WORKSPACE,
  UPDATE_WORKSPACE,
  CREATE_PROJECT,
  DELETE_PROJECT,
  UPDATE_PROJECT
} from '../../graphql/Mutation'

import { WORKSPACES_BY_OWNER, PROJECTS_BY_OWNER } from '../../graphql/Query'

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

const StaffView = ({ userId }) => {
  const workspaceQuery = useQuery(WORKSPACES_BY_OWNER, {
    variables: {
      ownerId: userId
    }
  })

  const projectQuery = useQuery(PROJECTS_BY_OWNER, {
    variables: {
      ownerId: userId
    }
  })

  const createWorkspace = useMutation(CREATE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACES_BY_OWNER, variables: {
        ownerId: userId
      }
    }]
  })

  const deleteWorkspace = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACES_BY_OWNER, variables: {
        ownerId: userId
      }
    }]
  })

  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACES_BY_OWNER, variables: {
        ownerId: userId
      }
    }]
  })

  const createProject = useMutation(CREATE_PROJECT, {
    refetchQueries: [{
      query: PROJECTS_BY_OWNER, variables: {
        ownerId: userId
      }
    }]
  })

  const deleteProject = useMutation(DELETE_PROJECT, {
    refetchQueries: [{
      query: PROJECTS_BY_OWNER, variables: {
        ownerId: userId
      }
    }]
  })

  const updateProject = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{
      query: PROJECTS_BY_OWNER, variables: {
        ownerId: userId
      }
    }]
  })

  const classes = useStyles()

  return (
    workspaceQuery.data.workspacesByOwner && projectQuery.data.projectsByOwner ?
      <div className={classes.root}>
        <WorkspaceList
          workspaces={workspaceQuery.data.workspacesByOwner}
          updateWorkspace={updateWorkspace}
          createWorkspace={createWorkspace}
          deleteWorkspace={deleteWorkspace}
        />
        <ProjectList
          projects={projectQuery.data.projectsByOwner}
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
