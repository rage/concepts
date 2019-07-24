import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { UPDATE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'
import { PROJECT_AND_DATA } from '../../graphql/Query'
import WorkspaceEditingDialog from '../workspace/WorkspaceEditingDialog'

const useEditTemplateDialog = (projectId) => {
  const [stateEdit, setStateEdit] = useState({ open: false, id: '', name: '' })

  const updateTemplateWorkspace = useMutation(UPDATE_TEMPLATE_WORKSPACE, {
    refetchQueries: [
      { query: PROJECT_AND_DATA, variables: { id: projectId } }
    ]
  })

  const handleEditClose = () => {
    setStateEdit({ open: false, id: '', name: '' })
  }

  const handleEditOpen = (id, name) => {
    setStateEdit({ open: true, id, name })
  }

  const dialog = (
    <WorkspaceEditingDialog
      state={stateEdit}
      handleClose={handleEditClose}
      updateTemplateWorkspace={updateTemplateWorkspace}
      defaultName={stateEdit.name}
    />
  )

  return {
    openEditTemplateDialog: handleEditOpen,
    TemplateEditDialog: dialog
  }
}

export default useEditTemplateDialog
