import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useMutation, useQuery } from 'react-apollo-hooks'
import { TextField, MenuItem } from '@material-ui/core'

import {
  PROJECT_BY_ID, PROJECT_BY_ID_MEMBER_INFO, WORKSPACE_BY_ID, WORKSPACE_BY_ID_MEMBER_INFO
} from '../../graphql/Query'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'
import EditableTable, { Type } from '../../components/EditableTable'
import { useLoginStateValue } from '../../store'
import { DELETE_PARTICIPANT, UPDATE_PARTICIPANT } from '../../graphql/Mutation'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto'
  }
}))

Type.PRIVILEGE = {
  ...Type.TEXT,
  DisplayComponent: ({ value, ...props }) => Type.TEXT.DisplayComponent({
    value: value.substr(0, 1) + value.substr(1).toLowerCase(),
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
      <MenuItem value='CLONE'>Clone</MenuItem>
      <MenuItem value='VIEW'>View</MenuItem>
      <MenuItem value='EDIT'>Edit</MenuItem>
      <MenuItem value='OWNER'>Owner</MenuItem>
    </TextField>
  ),
  defaultValue: 'EDIT'
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

  const mainQueryType = projectId ? PROJECT_BY_ID : WORKSPACE_BY_ID
  const memberQueryType = projectId ? PROJECT_BY_ID_MEMBER_INFO : WORKSPACE_BY_ID_MEMBER_INFO
  const id = projectId || workspaceId
  const type = projectId ? 'project' : 'workspace'

  const mainQuery = useQuery(mainQueryType, {
    variables: { id }
  })

  const mainData = mainQuery.data && mainQuery.data[`${type}ById`]

  const memberQuery = useQuery(memberQueryType, {
    variables: { id },
    skip: !mainData || (mainData.participants
      .find(pcp => pcp.user.id === user.id) || {}).privilege !== 'OWNER'
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

  const getName = user =>
    `${user.name || user.email || user.username || user.id} (${user.role.toLowerCase()})`

  return (
    <div className={classes.root}>
      <EditableTable
        title='Members'
        columns={columns}
        rows={(memberData || []).map(user => ({
          name: getName(user),
          privilege: user.privilege,
          token: user.token || {},
          id: user.participantId
        }))}
        deleteMutation={({ id }) => deleteParticipant({
          variables: { id, type: type.toUpperCase() }
        })}
        updateMutation={async ({ id, privilege }) => (await updateParticipant({
          variables: { id, privilege, type: type.toUpperCase() }
        })).data.updateParticipant}
      />
    </div>
  )
}

export default MembersView
