import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from 'react-apollo-hooks'
import { TextField, MenuItem } from '@material-ui/core'

import { PROJECT_BY_ID, WORKSPACE_BY_ID } from '../../graphql/Query'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'
import EditableTable, { Type } from '../../components/EditableTable'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto'
  }
}))

Type.PRIVILEGE = {
  ...Type.TEXT,
  EditComponent: ({ col, state, setState }) => (
    <TextField
      select
      name={col.field}
      value={state[col.field]}
      onChange={evt => setState({ ...state, [col.field]: evt.target.value })}
      margin='none'
    >
      <MenuItem value='CLONE'>Clone</MenuItem>
      <MenuItem value='READ'>Read</MenuItem>
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
  { title: 'User', field: 'id', type: Type.TEXT, readOnly: true },
  { title: 'Privilege', field: 'privilege', type: Type.PRIVILEGE },
  { title: 'Token', field: 'token', type: Type.SHARE_TOKEN }
]

const MembersView = ({ projectId, workspaceId }) => {
  const classes = useStyles()

  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId },
    skip: !projectId
  })

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId },
    skip: !workspaceId
  })

  if (projectQuery.loading || workspaceQuery.loading) {
    return <LoadingBar id='privilege-view' />
  } else if (projectQuery.error) {
    return <NotFoundView message='Project not found' />
  } else if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  }

  const privileges = (
    (projectQuery.data || {}).projectById ||
    (workspaceQuery.data || {}).workspaceById
  ).participants

  const getName = user => {
    const role = user.role.toLowerCase()
    return `${user.id} (${role})`
  }

  return (
    <div className={classes.root}>
      <EditableTable
        title='Members'
        columns={columns}
        rows={privileges.map(pcp => ({
          id: getName(pcp.user),
          privilege: pcp.privilege,
          token: pcp.token || {}
        }))}
      />
    </div>
  )
}

export default MembersView
