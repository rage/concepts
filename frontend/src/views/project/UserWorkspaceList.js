import React from 'react'
import { Button } from '@material-ui/core'

import { useShareDialog } from '../../dialogs/sharing'
import BaseWorkspaceList, { TYPE_USER } from '../../components/BaseWorkspaceList'

const UserWorkspaceList = ({ userWorkspaces, projectId, activeTemplate, urlPrefix }) => {
  const openShareDialog = useShareDialog(
    'project',
    'Invite students',
    'Let students clone the active template to contribute towards the mapping.')

  const cardHeaderTitle = 'Workspaces by users'
  const cardHeaderAction = (
    <Button
      variant='outlined' color='primary'
      onClick={() => openShareDialog(projectId, 'CLONE')}
      disabled={!activeTemplate}
    >
      Invite students
    </Button>
  )

  return <BaseWorkspaceList type={TYPE_USER}
    workspaces={userWorkspaces} urlPrefix={urlPrefix} activeTemplate={activeTemplate}
    cardHeaderTitle={cardHeaderTitle} cardHeaderAction={cardHeaderAction}
  />
}

export default UserWorkspaceList
