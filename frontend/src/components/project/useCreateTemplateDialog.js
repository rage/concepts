import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { CREATE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'
import { PROJECT_BY_ID } from '../../graphql/Query'
import TemplateCreationDialog from './TemplateCreationDialog'

const useCreateTemplateDialog = (projectId) => {
  const [stateCreate, setStateCreate] = useState({ open: false })

  const createTemplateWorkspace = useMutation(CREATE_TEMPLATE_WORKSPACE, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  const handleCreateClose = () => {
    setStateCreate({ open: false })
  }

  const handleCreateOpen = () => {
    setStateCreate({ open: true })
  }

  const dialog = (
    <TemplateCreationDialog
      state={stateCreate}
      handleClose={handleCreateClose}
      createTemplateWorkspace={createTemplateWorkspace}
      projectId={projectId}
    />
  )

  return {
    openCreateTemplateDialog: handleCreateOpen,
    TemplateCreateDialog: dialog
  }
}

export default useCreateTemplateDialog
