import React from 'react'
import { useMutation } from 'react-apollo-hooks'
import { Button, Tooltip } from '@material-ui/core'

import { PROJECT_BY_ID } from '../../graphql/Query'
import { DELETE_WORKSPACE, MERGE_PROJECT } from '../../graphql/Mutation'
import { useShareDialog } from '../../dialogs/sharing'
import { useEditWorkspaceDialog } from '../../dialogs/workspace'
import BaseWorkspaceList, { TYPE_MERGE } from '../../components/BaseWorkspaceList'
import { useInfoBox } from '../../components/InfoBox'

const MergeList = ({ mergeWorkspaces, canMerge, projectId, activeTemplate, urlPrefix }) => {
  const infoBox = useInfoBox()
  const openEditDialog = useEditWorkspaceDialog()
  const openShareDialog = useShareDialog('workspace')
  const deleteWorkspace = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })
  const merge = useMutation(MERGE_PROJECT, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })
  const cardHeaderTitle = 'Merged workspaces'
  let cardHeaderAction = (
    <Button
      style={{ margin: '6px' }}
      variant='outlined' color='primary'
      onClick={() => merge({ variables: { projectId } })}
      disabled={!canMerge}
      ref={infoBox.ref('project', 'MERGE_USER_WORKSPACES')}
    >
      New merge
    </Button>
  )

  if (!canMerge) {
    cardHeaderAction = (
      <Tooltip title='You must have existing student workspaces before merging' placement='bottom'>
        <div>{cardHeaderAction}</div>
      </Tooltip>
    )
  }

  return <BaseWorkspaceList type={TYPE_MERGE}
    workspaces={mergeWorkspaces} urlPrefix={urlPrefix} activeTemplate={activeTemplate}
    projectId={projectId} openEditDialog={openEditDialog} openShareDialog={openShareDialog}
    deleteWorkspace={deleteWorkspace} cardHeaderTitle={cardHeaderTitle}
    cardHeaderAction={cardHeaderAction}
  />
}

export default MergeList
