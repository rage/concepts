import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  BottomNavigation, BottomNavigationAction, Paper, IconButton, Menu, MenuItem, ListItemIcon
} from '@material-ui/core'
import {
  Shuffle as ShuffleIcon, ShowChart as ShowCartIcon, GridOn as GridOnIcon,
  DeviceHub as DeviceHubIcon, CloudDownload as CloudDownloadIcon, Delete as DeleteIcon,
  Edit as EditIcon, MoreVert as MoreVertIcon
} from '@material-ui/icons'

import client from '../../apollo/apolloClient'
import { EXPORT_QUERY, WORKSPACE_BY_ID, WORKSPACES_FOR_USER } from '../../graphql/Query'
import { DELETE_WORKSPACE } from '../../graphql/Mutation'

import { useQuery, useMutation } from 'react-apollo-hooks'

import useEditWorkspaceDialog from '../workspace/useEditWorkspaceDialog'

import { useErrorStateValue, useLoginStateValue } from '../../store'

const useStyles = makeStyles({
  root: {
    gridArea: 'bottom-navbar',
    display: 'flex',
    justifyContent: 'space-between'
  },
  leftPlaceholder: {
    width: '56px',
    height: '56px'
  },
  navbar: {
    flex: 1
  },
  menuButton: {
    width: '56px',
    height: '56px'
  }
})

export const exportWorkspace = async (workspaceId, workspaceName) => {
  const queryResponse = await client.query({
    query: EXPORT_QUERY,
    variables: {
      workspaceId: workspaceId
    }
  })

  const jsonData = queryResponse['data']['exportData']

  // Download JSON file
  const element = document.createElement('a')
  element.href = URL.createObjectURL(new Blob([jsonData], { 'type': 'application/json' }))
  element.download = `${workspaceName}.json`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const WorkspaceNavBar = ({ history, page, workspaceId, courseId }) => {
  const classes = useStyles()
  const { user } = useLoginStateValue()[0]
  const errorDispatch = useErrorStateValue()[1]
  const [menuAnchor, setMenuAnchor] = useState(null)

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const deleteWorkspace = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [
      { query: WORKSPACES_FOR_USER }
    ]
  })

  const {
    openEditWorkspaceDialog,
    WorkspaceEditDialog
  } = useEditWorkspaceDialog(workspaceId, user.id)

  const handleEditOpen = () => {
    openEditWorkspaceDialog(workspaceId, workspaceQuery.data.workspaceById.name)
  }

  const handleDelete = () => {

    deleteWorkspace({
      variables: {
        id: workspaceId
      }
    })
      .catch(() => {
        errorDispatch({
          type: 'setError',
          data: 'Failed to delete workspace'
        })
        setTimeout(() =>
          errorDispatch({ type: 'clearError' })
        , 2000)
      })
      .finally(() => {
        history.push('/user')
      })
  }


  const handleWorkspaceExport = async () => {
    setMenuAnchor(null)
    try {
      await exportWorkspace(workspaceId, workspaceId)
    } catch (err) {
      errorDispatch({
        type: 'setError',
        data: err.message
      })
    }
  }

  const onChange = (event, newPage) => {
    const cid = courseId && newPage !== 'heatmap' && newPage !== 'graph' ? `/${courseId}` : ''
    history.push(`/workspaces/${workspaceId}/${newPage}${cid}`)
  }

  return (
    <>
      <Paper className={classes.root} square>
        {/* Placeholder so flex would align navbar at center*/}
        {user.role === 'STAFF' && <div className={classes.leftPlaceholder} />}
        <BottomNavigation showLabels value={page} onChange={onChange} className={classes.navbar}>
          <BottomNavigationAction value='mapper' label='Course Mapper' icon={<ShuffleIcon />} />
          <BottomNavigationAction value='matrix' label='Concept Matrix' icon={<ShowCartIcon />} />
          <BottomNavigationAction value='graph' label='Graph' icon={<DeviceHubIcon />} />
          <BottomNavigationAction value='heatmap' label='Heatmap' icon={<GridOnIcon />} />
        </BottomNavigation>
        {user.role === 'STAFF' && <>
          <IconButton
            onClick={evt => setMenuAnchor(evt.currentTarget)}
            className={classes.menuButton}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}>
            <MenuItem aria-label='Export' onClick={handleWorkspaceExport}>
              <ListItemIcon>
                <CloudDownloadIcon />
              </ListItemIcon>
              Export
            </MenuItem>
            <MenuItem aria-label='Delete' onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              Delete
            </MenuItem>
            <MenuItem aria-label='Edit' onClick={handleEditOpen}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              Edit
            </MenuItem>
          </Menu>
        </>}
      </Paper>
      {WorkspaceEditDialog}
    </>
  )
}

export default withRouter(WorkspaceNavBar)
