import React from 'react'

import { useQuery, useMutation } from 'react-apollo-hooks'
import {
  CREATE_WORKSPACE, DELETE_WORKSPACE, UPDATE_WORKSPACE
} from '../../graphql/Mutation/Workspace'
import { WORKSPACES_FOR_USER } from '../../graphql/Query/Workspace'

import WorkspaceList from '../workspace/WorkspaceList'

import CircularProgress from '@material-ui/core/CircularProgress'

const UserView = ({ userId }) => {
  const workspaceQuery = useQuery(WORKSPACES_FOR_USER)

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

  return (
    workspaceQuery.data.workspacesForUser ?
      <WorkspaceList
        workspaces={workspaceQuery.data.workspacesForUser.map(ws => ws.workspace)} updateWorkspace={updateWorkspace}
        createWorkspace={createWorkspace} deleteWorkspace={deleteWorkspace} />
      :
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
  )
}

export default UserView
