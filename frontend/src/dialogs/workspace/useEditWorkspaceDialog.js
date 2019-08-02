import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'

import { UPDATE_WORKSPACE } from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER, WORKSPACE_BY_ID } from '../../graphql/Query'
import Dialog from '../Dialog'

const useEditWorkspaceDialog = (workspaceId) => {
  const [workspaceEditState, setWorkspaceEditState] = useState({
    open: false,
    id: '',
    name: ''
  })

  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: [
      { query: WORKSPACES_FOR_USER },
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
    <Dialog
      open={workspaceEditState.open}
      onClose={handleEditClose}
      mutation={updateWorkspace}
      requiredVariables={{ id: workspaceId }}
      actionText='Save'
      fields={['name']}
      title='Edit workspace'
      content={[
        'Workspaces work as a sandbox for you to create and connect concepts with each other.'
      ]}
    />
  )

  return {
    openEditWorkspaceDialog: handleEditOpen,
    WorkspaceEditDialog: dialog
  }
}

export default useEditWorkspaceDialog
