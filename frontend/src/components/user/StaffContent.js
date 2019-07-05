import React from 'react'

import Grid from '@material-ui/core/Grid'

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

import CircularProgress from '@material-ui/core/CircularProgress'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
})

const UserView = ({ classes, userId }) => {

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

  return (
    <React.Fragment>
      {
        workspaceQuery.data.workspacesByOwner && projectQuery.data.projectsByOwner ?
          <Grid container spacing={0} direction='column'>
            <Grid item>
              <WorkspaceList
                workspaces={workspaceQuery.data.workspacesByOwner}
                updateWorkspace={updateWorkspace}
                createWorkspace={createWorkspace}
                deleteWorkspace={deleteWorkspace}
              />
            </Grid>
            <Grid item>
              <ProjectList
                projects={projectQuery.data.projectsByOwner}
                updateProject={updateProject}
                createProject={createProject}
                deleteProject={deleteProject}
              />
            </Grid>
          </Grid>
          :
          <Grid container
            spacing={0}
            direction='row'
            justify='center'
            alignItems='center'
          >
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                <CircularProgress />
              </div>
            </Grid>
          </Grid>
      }
    </ React.Fragment>
  )
}

export default withStyles(styles)(UserView)
