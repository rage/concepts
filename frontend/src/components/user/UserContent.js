import React from 'react'

import { useQuery, useMutation } from 'react-apollo-hooks'
import {
  CREATE_WORKSPACE, DELETE_WORKSPACE, UPDATE_WORKSPACE
} from '../../graphql/Mutation/Workspace'
import { WORKSPACES_BY_OWNER } from '../../graphql/Query/Workspace'

import WorkspaceList from '../workspace/WorkspaceList'

import CircularProgress from '@material-ui/core/CircularProgress'

const UserView = ({ userId }) => {
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
    workspaceQuery.data.workspacesByOwner ?
      <WorkspaceList
        workspaces={workspaceQuery.data.workspacesByOwner} updateWorkspace={updateWorkspace}
        createWorkspace={createWorkspace} deleteWorkspace={deleteWorkspace} />
      :
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
  )
}

export default UserView
