import React from 'react'
import { Button, Tooltip } from '@material-ui/core'

import { Privilege } from '../../lib/permissions'
import { useShareDialog } from '../../dialogs/sharing'
import BaseWorkspaceList, { TYPE_USER } from '../../components/BaseWorkspaceList'
import { useInfoBox } from '../../components/InfoBox'

const UserWorkspaceList = ({ userWorkspaces, projectId, activeTemplate, urlPrefix }) => {
  const infoBox = useInfoBox()
  const openShareDialog = useShareDialog(
    'project',
    'Invite students',
    'Let students clone the active template to contribute towards the mapping.')

  const cardHeaderTitle = 'Workspaces by users'
  let cardHeaderAction = (
    <Button
      style={{ margin: '6px' }}
      variant='outlined' color='primary'
      onClick={() => openShareDialog(projectId, Privilege.CLONE)}
      disabled={!activeTemplate}
      ref={infoBox.ref('project', 'INVITE_STUDENTS')}
    >
      Invite students
    </Button>
  )

  if (!activeTemplate) {
    cardHeaderAction = (
      <Tooltip title='You must add an active template before inviting students' placement='bottom'>
        <div>{cardHeaderAction}</div>
      </Tooltip>
    )
  }

  return <BaseWorkspaceList type={TYPE_USER}
    workspaces={userWorkspaces} urlPrefix={urlPrefix} projectId={projectId}
    activeTemplate={activeTemplate} cardHeaderTitle={cardHeaderTitle}
    cardHeaderAction={cardHeaderAction}
  />
}

export default UserWorkspaceList
