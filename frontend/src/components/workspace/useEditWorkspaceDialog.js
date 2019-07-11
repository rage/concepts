import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { UPDATE_WORKSPACE } from '../../graphql/Mutation'
import { WORKSPACES_BY_OWNER, WORKSPACE_BY_ID } from '../../graphql/Query'
import WorkspaceEditingDialog from '../workspace/WorkspaceEditingDialog'

const useEditWorkspaceDialog = (workspaceId, userId) => {
  const [workspaceEditState, setWorkspaceEditState] = useState({
    open: false,
    id: '',
    name: ''
  })

  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: [
      { query: WORKSPACES_BY_OWNER, variables: { ownerId: userId } },
      { query: WORKSPACE_BY_ID, variables: { id: workspaceId } }
    ]
  })

  const handleEditClose = () => {
    setWorkspaceEditState({ open: false, id: '', name: '' })
  }

  const handleEditOpen = (id, name) => {
    setWorkspaceEditState({ open: true, id, name })
  }

  const dialog = (
    <WorkspaceEditingDialog
      state={workspaceEditState}
      handleClose={handleEditClose}
      updateWorkspace={updateWorkspace}
      defaultName={workspaceEditState.name} />
  )

  return {
    openEditWorkspaceDialog: handleEditOpen,
    WorkspaceEditDialog: dialog
  }
}

export default useEditWorkspaceDialog
