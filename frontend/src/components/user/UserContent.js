import React from 'react'

import { useQuery, useMutation } from 'react-apollo-hooks'
import {
  CREATE_WORKSPACE, DELETE_WORKSPACE, UPDATE_WORKSPACE, CREATE_SHARE_LINK
} from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER } from '../../graphql/Query/Workspace'

import WorkspaceList from '../workspace/WorkspaceList'

import CircularProgress from '@material-ui/core/CircularProgress'

const UserView = () => {
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

  const createShareLink = useMutation(CREATE_SHARE_LINK, {
    refetchQueries: [{
      query: WORKSPACES_FOR_USER
    }]
  })

  return (
    workspaceQuery.data.workspacesForUser ?
      <WorkspaceList
        workspaces={workspaceQuery.data.workspacesForUser.map(ws => ws.workspace)}
        updateWorkspace={updateWorkspace}
        createWorkspace={createWorkspace}
        deleteWorkspace={deleteWorkspace}
        createShareLink={createShareLink}
      />
      :
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
  )
}

export default UserView
