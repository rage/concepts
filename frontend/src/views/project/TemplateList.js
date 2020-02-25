import React from 'react'
import { useMutation } from '@apollo/react-hooks'

import { useEditTemplateDialog, useCreateTemplateDialog } from '../../dialogs/project'
import { useShareDialog } from '../../dialogs/sharing'
import { DELETE_TEMPLATE_WORKSPACE, SET_ACTIVE_TEMPLATE } from '../../graphql/Mutation'
import { PROJECT_BY_ID } from '../../graphql/Query'
import BaseWorkspaceList, { TYPE_TEMPLATE } from '../../components/BaseWorkspaceList'
import cache from '../../apollo/update'

const TemplateList = ({ templateWorkspaces, projectId, activeTemplate, urlPrefix }) => {
  const openEditDialog = useEditTemplateDialog(projectId)
  const openCreateDialog = useCreateTemplateDialog(projectId)
  const openShareDialog = useShareDialog('workspace')
  const [setActiveTemplate] = useMutation(SET_ACTIVE_TEMPLATE, {
    update: cache.updateActiveTemplate(projectId)
  })
  const [deleteWorkspace] = useMutation(DELETE_TEMPLATE_WORKSPACE, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })
  const cardHeaderTitle = 'Template workspaces'

  return <BaseWorkspaceList type={TYPE_TEMPLATE}
    workspaces={templateWorkspaces} urlPrefix={urlPrefix} activeTemplate={activeTemplate}
    projectId={projectId} openEditDialog={openEditDialog} openShareDialog={openShareDialog}
    openCreateDialog={openCreateDialog} setActiveTemplate={setActiveTemplate}
    deleteWorkspace={deleteWorkspace} cardHeaderTitle={cardHeaderTitle}
  />
}

export default TemplateList
