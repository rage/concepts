import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Button } from '@material-ui/core'

import { PROJECT_BY_ID } from '../../graphql/Query'
import { DELETE_WORKSPACE, MERGE_PROJECT } from '../../graphql/Mutation'
import { useShareDialog } from '../../dialogs/sharing'
import { useEditWorkspaceDialog } from '../../dialogs/workspace'
import BaseWorkspaceList, { TYPE_MERGE } from '../../components/BaseWorkspaceList'

const MergeList = ({ mergeWorkspaces, projectId, activeTemplate, urlPrefix }) => {
  const openEditDialog = useEditWorkspaceDialog()
  const openShareDialog = useShareDialog('workspace')
  const [deleteWorkspace] = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })
  const [merge] = useMutation(MERGE_PROJECT, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })
  const cardHeaderTitle = 'Merged workspaces'
  const cardHeaderAction = (
    <Button
      style={{ margin: '6px' }}
      variant='outlined' color='primary'
      onClick={() => merge({ variables: { projectId } })}
      disabled={!activeTemplate}
    >
      New merge
    </Button>
  )

  return <BaseWorkspaceList type={TYPE_MERGE}
    workspaces={mergeWorkspaces} urlPrefix={urlPrefix} activeTemplate={activeTemplate}
    projectId={projectId} openEditDialog={openEditDialog} openShareDialog={openShareDialog}
    deleteWorkspace={deleteWorkspace} cardHeaderTitle={cardHeaderTitle}
    cardHeaderAction={cardHeaderAction}
  />
}

export default MergeList
