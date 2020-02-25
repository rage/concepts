import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { TextField, MenuItem } from '@material-ui/core'

import { Privilege } from '../../lib/permissions'
import {
  PROJECT_BY_ID, PROJECT_BY_ID_MEMBER_INFO, WORKSPACE_BY_ID, WORKSPACE_BY_ID_MEMBER_INFO
} from '../../graphql/Query'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'
import EditableTable, { Type } from '../../components/EditableTable'
import { useLoginStateValue } from '../../lib/store'
import { DELETE_PARTICIPANT, UPDATE_PARTICIPANT } from '../../graphql/Mutation'
import useRouter from '../../lib/useRouter'
import {
  useUpdatingSubscription
} from '../../apollo/useUpdatingSubscription'
import { useConfirm } from '../../dialogs/alert'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    gridArea: 'content',
    overflow: 'hidden'
  }
}))

Type.PRIVILEGE = {
  ...Type.TEXT,
  DisplayComponent: ({ value, ...props }) => Type.TEXT.DisplayComponent({
    value: value.toTitleCase(),
    ...props
  }),
  EditComponent: ({ col, state, setState }) => (
    <TextField
      select
      name={col.field}
      value={state[col.field]}
      onChange={evt => setState({ ...state, [col.field]: evt.target.value })}
      margin='none'
    >
      <MenuItem value={Privilege.CLONE.toString()}>Clone</MenuItem>
      <MenuItem value={Privilege.VIEW.toString()}>View</MenuItem>
      <MenuItem value={Privilege.EDIT.toString()}>Edit</MenuItem>
      <MenuItem value={Privilege.OWNER.toString()}>Owner</MenuItem>
    </TextField>
  ),
  defaultValue: Privilege.EDIT.toString()
}

Type.SHARE_TOKEN = {
  ...Type.TEXT,
  DisplayComponent: ({ value: { id, revoked } }) => revoked ? <del>{id}</del> : id || null
}

const columns = [
  { title: 'User', field: 'name', type: Type.TEXT, readOnly: true },
  { title: 'Privilege', field: 'privilege', type: Type.PRIVILEGE },
  { title: 'Token', field: 'token', type: Type.SHARE_TOKEN, readOnly: true },
  { field: 'id', type: Type.TEXT, hidden: true }
]

const MembersView = ({ projectId, workspaceId }) => {
  const classes = useStyles()
  const [{ user }] = useLoginStateValue()
  const { history } = useRouter()
  const confirm = useConfirm()

  const mainQueryType = projectId ? PROJECT_BY_ID : WORKSPACE_BY_ID
  const memberQueryType = projectId ? PROJECT_BY_ID_MEMBER_INFO : WORKSPACE_BY_ID_MEMBER_INFO
  const id = projectId || workspaceId
  const type = projectId ? 'project' : 'workspace'

  useUpdatingSubscription(`${type} member`, 'create', {
    variables: { [`${type}Id`]: id }
  })

  useUpdatingSubscription(`${type} member`, 'update', {
    variables: { [`${type}Id`]: id }
  })

  useUpdatingSubscription(`${type} member`, 'delete', {
    variables: { [`${type}Id`]: id }
  })

  const mainQuery = useQuery(mainQueryType, {
    variables: { id }
  })

  const mainData = mainQuery.data && mainQuery.data[`${type}ById`]

  const memberQuery = useQuery(memberQueryType, {
    variables: { id },
    skip: !mainData || Privilege.fromString((mainData.participants
      .find(pcp => pcp.user.id === user.id) || {}).privilege) !== Privilege.OWNER
  })

  const memberData = memberQuery.data && memberQuery.data[`${type}MemberInfo`]

  const updateParticipant = useMutation(UPDATE_PARTICIPANT, {
    refetchQueries: [{
      query: memberQueryType,
      variables: { id }
    }]
  })

  const deleteParticipant = useMutation(DELETE_PARTICIPANT, {
    refetchQueries: [{
      query: memberQueryType,
      variables: { id }
    }]
  })

  if (mainQuery.loading) {
    return <LoadingBar id='privilege-view' />
  } else if (mainQuery.error) {
    return <NotFoundView message={`${projectId ? 'Project' : 'Workspace'} not found`} />
  }

  const getName = member =>
    `${member.name || member.email || member.username || member.id} (${member.role.toLowerCase()})`
    + (member.id === user.id ? ' (you)' : '')

  return (
    <main className={classes.root}>
      <EditableTable
        title='Members'
        columns={columns}
        rows={(memberData || []).map(member => ({
          name: getName(member),
          privilege: member.privilege,
          token: member.token || {},
          id: member.participantId
        }))}
        deleteMutation={async ({ id }) => {
          const data = memberData.find(member => member.participantId === id)
          const ok = await confirm({
            title: 'Confirm participant removal',
            message: `Are you sure you want to remove ${
              data?.id === user.id ? 'yourself' : data?.id || id} from this project?`,
            confirm: 'Yes, remove',
            cancel: 'No, cancel'
          })
          if (!ok) {
            return
          }
          await deleteParticipant({
            variables: { id, type: type.toUpperCase() }
          })
          if (data?.id === user.id) {
            history.push('../../..')
          }
        }}
        updateMutation={async ({ id, privilege }) => (await updateParticipant({
          variables: { id, privilege, type: type.toUpperCase() }
        })).data.updateParticipant}
      />
    </main>
  )
}

export default MembersView
