import React from 'react'
import { Button } from '@material-ui/core'

import { Privilege } from '../../lib/permissions'
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
      style={{ margin: '6px' }}
      variant='outlined' color='primary'
      onClick={() => openShareDialog(projectId, Privilege.CLONE)}
      disabled={!activeTemplate}
    >
      Invite students
    </Button>
  )

  return <BaseWorkspaceList type={TYPE_USER}
    workspaces={userWorkspaces} urlPrefix={urlPrefix} projectId={projectId}
    activeTemplate={activeTemplate} cardHeaderTitle={cardHeaderTitle}
    cardHeaderAction={cardHeaderAction}
  />
}

export default UserWorkspaceList
