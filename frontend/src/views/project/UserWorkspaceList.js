import React, { useRef, useState } from 'react'
import { Button, Tooltip, ButtonGroup, Menu, MenuItem } from '@material-ui/core'
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons'
import { useMutation } from '@apollo/react-hooks'

import { Privilege } from '../../lib/permissions'
import generateName from '../../lib/generateName'
import { useShareDialog } from '../../dialogs/sharing'
import BaseWorkspaceList, { TYPE_USER } from '../../components/BaseWorkspaceList'
import { useInfoBox } from '../../components/InfoBox'
import { CLONE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'

const InviteOrCloneButton = ({ projectId, activeTemplate }) => {
  const infoBox = useInfoBox()
  const openShareDialog = useShareDialog(
    'project',
    'Invite students',
    'Let students clone the active template to contribute towards the mapping.')
  const anchorRef = useRef()
  const [open, setOpen] = useState(false)
  const [mode, setModeDirect] = useState('invite')

  const [cloneTemplate] = useMutation(CLONE_TEMPLATE_WORKSPACE)

  const onClick = () => {
    if (mode === 'invite') {
      openShareDialog(projectId, Privilege.CLONE)
    } else {
      cloneTemplate({
        variables: {
          projectId,
          name: generateName()
        }
      })
    }
  }
  const inviteRef = infoBox.ref('project', 'INVITE_STUDENTS')

  const setMode = val => () => {
    setOpen(false)
    setModeDirect(val)
  }

  return <>
    <ButtonGroup
      style={{ margin: '6px' }} variant='outlined' color='primary' ref={anchorRef}
      disabled={!activeTemplate}
    >
      <Button variant='outlined' color='primary' onClick={onClick} ref={inviteRef}>
        {mode === 'invite' ? 'Invite students' : 'Create clone'}
      </Button>
      <Button variant='outlined' color='primary' onClick={() => setOpen(true)}>
        <ArrowDropDownIcon />
      </Button>
    </ButtonGroup>
    <Menu open={open} onClose={() => setOpen(false)} anchorEl={anchorRef.current}>
      <MenuItem selected={mode === 'invite'} onClick={setMode('invite')}>
        Invite students
      </MenuItem>
      <MenuItem selected={mode === 'clone'} onClick={setMode('clone')}>
        Create clone
      </MenuItem>
    </Menu>
  </>
}

const UserWorkspaceList = ({ userWorkspaces, projectId, activeTemplate, urlPrefix }) => {
  const cardHeaderTitle = 'Workspaces by users'
  let cardHeaderAction = <InviteOrCloneButton
    projectId={projectId}
    activeTemplate={activeTemplate}
  />

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
