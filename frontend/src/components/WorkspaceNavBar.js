import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  BottomNavigation, BottomNavigationAction, Paper, IconButton, Menu, MenuItem, ListItemIcon
} from '@material-ui/core'
import {
  Shuffle as ShuffleIcon, GridOn as GridOnIcon, DeviceHub as DeviceHubIcon, Group as GroupIcon,
  CloudDownload as CloudDownloadIcon, Delete as DeleteIcon, Edit as EditIcon, Share as ShareIcon,
  MoreVert as MoreVertIcon, VerticalSplit as VerticalSplitIcon
} from '@material-ui/icons'

import client from '../apollo/apolloClient'
import { EXPORT_QUERY, WORKSPACE_BY_ID, WORKSPACES_FOR_USER } from '../graphql/Query'
import { DELETE_WORKSPACE } from '../graphql/Mutation'
import useEditWorkspaceDialog from '../dialogs/workspace/useEditWorkspaceDialog'
import { useMessageStateValue, useLoginStateValue } from '../store'
import { useShareDialog } from '../dialogs/sharing'

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
    flex: 1,
    zIndex: 2
  },
  menuButton: {
    width: '56px',
    height: '56px'
  }
})

const downloadFile = (data, fileName) => {
  const element = document.createElement('a')
  element.href = URL.createObjectURL(new Blob([data], { 'type': 'application/json' }))
  element.download = fileName
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export const exportWorkspace = async (workspaceId, workspaceName) => {
  const queryResponse = await client.query({
    query: EXPORT_QUERY,
    variables: {
      workspaceId: workspaceId
    }
  })

  downloadFile(queryResponse['data']['exportData'], `${workspaceName}.json`)
}

const WorkspaceNavBar = ({ history, page, workspaceId, courseId, urlPrefix }) => {
  const classes = useStyles()
  const { user } = useLoginStateValue()[0]
  const messageDispatch = useMessageStateValue()[1]
  const [menuAnchor, setMenuAnchor] = useState(null)

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const deleteWorkspace = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [
      { query: WORKSPACES_FOR_USER }
    ]
  })

  const openEditWorkspaceDialog = useEditWorkspaceDialog(workspaceId)
  const openShareWorkspaceDialog = useShareDialog('workspace')

  const handleEditOpen = () => {
    setMenuAnchor(null)
    openEditWorkspaceDialog(workspaceId, workspaceQuery.data.workspaceById.name)
  }

  const handleShareOpen = () => {
    setMenuAnchor(null)
    openShareWorkspaceDialog(workspaceId, 'EDIT')
  }

  const handleDelete = () => {
    setMenuAnchor(null)
    deleteWorkspace({
      variables: {
        id: workspaceId
      }
    })
      .catch(() => {
        messageDispatch({
          type: 'setError',
          data: 'Failed to delete workspace'
        })
        setTimeout(() =>
          messageDispatch({ type: 'clearError' })
        , 2000)
      })
      .finally(() => {
        history.push('/')
      })
  }

  const handleWorkspaceExport = async () => {
    setMenuAnchor(null)
    try {
      await exportWorkspace(workspaceId, workspaceId)
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: err.message
      })
    }
  }

  const onChange = (event, newPage) => {
    const cid = courseId && newPage === 'mapper' ? `/${courseId}` : ''
    history.push(`${urlPrefix}/${workspaceId}/${newPage}${cid}`)
  }

  return (
    <>
      <Paper className={classes.root} square>
        { /* Placeholder so flex would align navbar at center*/
          user.role === 'STAFF' && <div className={classes.leftPlaceholder} />
        }
        <BottomNavigation showLabels value={page} onChange={onChange} className={classes.navbar}>
          <BottomNavigationAction value='manager' label='Manager' icon={<VerticalSplitIcon />} />
          <BottomNavigationAction value='mapper' label='Course Mapper' icon={<ShuffleIcon />} />
          <BottomNavigationAction value='graph' label='Graph' icon={<DeviceHubIcon />} />
          <BottomNavigationAction value='heatmap' label='Heatmap' icon={<GridOnIcon />} />
          <BottomNavigationAction value='members' label='Members' icon={<GroupIcon />} />
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
            <MenuItem aria-label='Share link' onClick={handleShareOpen}>
              <ListItemIcon>
                <ShareIcon />
              </ListItemIcon>
              Share link
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
    </>
  )
}

export default withRouter(WorkspaceNavBar)
