import React from 'react'

import Grid from '@material-ui/core/Grid'

import { useQuery, useMutation } from 'react-apollo-hooks'
import { CREATE_WORKSPACE, DELETE_WORKSPACE, UPDATE_WORKSPACE } from '../../graphql/Mutation/Workspace'
import { WORKSPACES_BY_OWNER } from '../../graphql/Query/Workspace'

import WorkspaceList from '../workspace/WorkspaceList'

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

  return (
    <React.Fragment>
      {
        workspaceQuery.data.workspacesByOwner ?
          <Grid container spacing={0} direction="column">
            <WorkspaceList workspaces={workspaceQuery.data.workspacesByOwner} updateWorkspace={updateWorkspace} createWorkspace={createWorkspace} deleteWorkspace={deleteWorkspace} />
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