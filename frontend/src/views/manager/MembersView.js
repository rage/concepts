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

const columns = [
  { title: 'User', field: 'id', type: Type.TEXT, readOnly: true },
  { title: 'Privilege', field: 'privilege', type: Type.PRIVILEGE },
  { title: 'Token', field: 'token', type: Type.TEXT }
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

  return (
    <div className={classes.root}>
      <EditableTable
        columns={columns}
        rows={privileges.map(pcp => ({
          id: `${pcp.user.role} ${pcp.user.id}`,
          privilege: pcp.privilege,
          token: pcp.token ? pcp.token.id : ''
        }))}
      />
    </div>
  )
}

export default MembersView
