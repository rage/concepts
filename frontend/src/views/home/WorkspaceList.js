import React from 'react'
import { useMutation } from 'react-apollo-hooks'

import { useCreateWorkspaceDialog, useEditWorkspaceDialog } from '../../dialogs/workspace'
import { useShareDialog } from '../../dialogs/sharing'
import { DELETE_WORKSPACE } from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER } from '../../graphql/Query'
import BaseWorkspaceList, { TYPE_MAIN } from '../../components/BaseWorkspaceList'

const WorkspaceList = ({ workspaces, urlPrefix }) => {
  const openEditDialog = useEditWorkspaceDialog()
  const openShareDialog = useShareDialog('workspace')
  const openCreateDialog = useCreateWorkspaceDialog()
  const deleteWorkspace = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACES_FOR_USER
    }]
  })
  const cardHeaderTitle = 'Workspaces'
  return <BaseWorkspaceList type={TYPE_MAIN} style={{ gridArea: 'workspaces' }}
    workspaces={workspaces} urlPrefix={urlPrefix} openEditDialog={openEditDialog}
    openShareDialog={openShareDialog} openCreateDialog={openCreateDialog}
    deleteWorkspace={deleteWorkspace} cardHeaderTitle={cardHeaderTitle}
  />
}

export default WorkspaceList
