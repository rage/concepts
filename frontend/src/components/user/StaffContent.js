import React from 'react'

import Grid from '@material-ui/core/Grid'

import { useQuery, useMutation } from 'react-apollo-hooks'
import { CREATE_WORKSPACE, DELETE_WORKSPACE, UPDATE_WORKSPACE } from '../../graphql/Mutation/Workspace'
import { STAFF_BY_ID } from '../../graphql/Query/User'
import { CREATE_PROJECT, DELETE_PROJECT, UPDATE_PROJECT } from '../../graphql/Mutation/Project'

import WorkspaceList from '../workspace/WorkspaceList'
import ProjectList from '../project/ProjectList'

import CircularProgress from '@material-ui/core/CircularProgress'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
})

const UserView = ({ classes, userId }) => {

  const userQuery = useQuery(STAFF_BY_ID, {
    variables: {
      id: userId
    }
  })

  const createWorkspace = useMutation(CREATE_WORKSPACE, {
    refetchQueries: [{
      query: STAFF_BY_ID, variables: {
        id: userId
      }
    }]
  })

  const deleteWorkspace = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [{
      query: STAFF_BY_ID, variables: {
        id: userId
      }
    }]
  })

  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: [{
      query: STAFF_BY_ID, variables: {
        id: userId
      }
    }]
  })

  const createProject = useMutation(CREATE_PROJECT, {
    refetchQueries: [{
      query: STAFF_BY_ID, variables: {
        id: userId
      }
    }]
  })

  const deleteProject = useMutation(DELETE_PROJECT, {
    refetchQueries: [{
      query: STAFF_BY_ID, variables: {
        id: userId
      }
    }]
  })

  const updateProject = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{
      query: STAFF_BY_ID, variables: {
        id: userId
      }
    }]
  })

  return (
    <React.Fragment>
      {
        userQuery.data.userById ?
          <Grid container spacing={0} direction="column">
            <Grid item>
              <WorkspaceList
                workspaces={userQuery.data.userById.asWorkspaceOwner}
                updateWorkspace={updateWorkspace}
                createWorkspace={createWorkspace}
                deleteWorkspace={deleteWorkspace}
              />
            </Grid>
            <br />
            <Grid item>
              <ProjectList
                projects={userQuery.data.userById.asProjectOwner}
                updateProject={updateProject}
                createProject={createProject}
                deleteProject={deleteProject}
              />
            </Grid>
          </Grid>
          :
          <Grid container
            spacing={0}
            direction="row"
            justify="center"
            alignItems="center"
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