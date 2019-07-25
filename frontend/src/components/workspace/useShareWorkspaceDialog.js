import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo-hooks'
import { CREATE_SHARE_LINK, DELETE_SHARE_LINK } from '../../graphql/Mutation'
import { WORKSPACE_BY_ID, WORKSPACES_FOR_USER } from '../../graphql/Query'
import WorkspaceSharingDialog from './WorkspaceSharingDialog'

const useShareWorkspaceDialog = () => {
  const [workspaceShareState, setWorkspaceShareState] = useState({
    open: false,
    id: null
  })

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    skip: !workspaceShareState.id,
    variables: {
      id: workspaceShareState.id
    }
  })

  const createShareLink = useMutation(CREATE_SHARE_LINK, {
    refetchQueries: [
      { query: WORKSPACES_FOR_USER },
      {
        query: WORKSPACE_BY_ID,
        variables: {
          id: workspaceShareState.id
        }
      }
    ]
  })

  const deleteShareLink = useMutation(DELETE_SHARE_LINK)

  const handleShareClose = () => {
    setWorkspaceShareState({ open: false, id: null })
  }

  const handleShareOpen = id => {
    setWorkspaceShareState({ open: true, id })
  }

  const dialog = (
    <WorkspaceSharingDialog
      open={workspaceShareState.open}
      workspace={workspaceQuery.data ? workspaceQuery.data.workspaceById : null}
      handleClose={handleShareClose}
      createShareLink={createShareLink}
      deleteShareLink={deleteShareLink}
    />
  )

  return {
    openShareWorkspaceDialog: handleShareOpen,
    WorkspaceShareDialog: dialog
  }
}

export default useShareWorkspaceDialog
