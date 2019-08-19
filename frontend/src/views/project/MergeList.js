import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { withRouter } from 'react-router-dom'
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Card, CardHeader, IconButton,
  Menu, MenuItem, ListItemIcon, Button
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
  GridOn as GridOnIcon,
  MoreVert as MoreVertIcon,
  CloudDownload as CloudDownloadIcon, Share as ShareIcon, Edit as EditIcon, Delete as DeleteIcon
} from '@material-ui/icons'

import { exportWorkspace } from '../../components/WorkspaceNavBar'
import { useLoginStateValue, useMessageStateValue } from '../../store'
import { PROJECT_BY_ID, WORKSPACES_FOR_USER } from '../../graphql/Query'
import { DELETE_WORKSPACE, MERGE_PROJECT } from '../../graphql/Mutation'
import { useShareDialog } from '../../dialogs/sharing'
import { useEditWorkspaceDialog } from '../../dialogs/workspace'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    overflow: 'visible'
  },
  progress: {
    margin: theme.spacing(2)
  }
}))

const MergeList = ({ history, mergeWorkspaces, activeTemplate, projectId }) => {
  const [menu, setMenu] = useState(null)
  const [{ loggedIn }] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const openEditWorkspaceDialog = useEditWorkspaceDialog()
  const openShareWorkspaceDialog = useShareDialog('workspace')

  const merge = useMutation(MERGE_PROJECT, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })

  const deleteWorkspace = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })

  const classes = useStyles()

  const handleNavigateMapper = (workspaceId) => {
    history.push(`/projects/${projectId}/merges/${workspaceId}/mapper`)
  }

  const handleNavigateHeatmap = () => {
    history.push(`/projects/${projectId}/merges/${menu.workspace.id}/heatmap`)
  }

  const handleMenuOpen = (workspace, event) => {
    setMenu({
      anchor: event.currentTarget,
      workspace
    })
  }

  const handleMenuClose = () => {
    setMenu(null)
  }

  const handleWorkspaceExport = async () => {
    handleMenuClose()
    try {
      await exportWorkspace(menu.workspace.id, menu.workspace.name)
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: err.message
      })
    }
  }

  const handleEditOpen = () => {
    handleMenuClose()
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    openEditWorkspaceDialog(menu.workspace.id, menu.workspace.name)
  }

  const handleShareOpen = () => {
    handleMenuClose()
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    openShareWorkspaceDialog(menu.workspace.id, 'EDIT')
  }

  const handleDelete = async () => {
    handleMenuClose()
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    const willDelete = window.confirm('Are you sure you want to delete this merge?')
    if (willDelete) {
      try {
        await deleteWorkspace({
          variables: { id: menu.workspace.id }
        })
      } catch (err) {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
  }

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        action={
          <Button
            variant='outlined' color='primary'
            onClick={() => merge({ variables: { projectId } })}
            disabled={!activeTemplate}
          >
            New merge
          </Button>
        }
        title='Merged workspaces'
      />
      <List dense={false}>
        {
          mergeWorkspaces.map(workspace => (
            <ListItem
              button key={workspace.id} onClick={() => handleNavigateMapper(workspace.id)}
            >
              <ListItemText primary={workspace.name} />

              <ListItemSecondaryAction>
                <IconButton
                  aria-owns={menu ? 'merge-list-menu' : undefined}
                  onClick={evt => handleMenuOpen(workspace, evt)} aria-haspopup='true'>
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        }
      </List>
      <Menu
        id='template-list-menu' anchorEl={menu ? menu.anchor : undefined} open={Boolean(menu)}
        onClose={handleMenuClose}
      >
        <MenuItem aria-label='Heatmap' onClick={handleNavigateHeatmap}>
          <ListItemIcon>
            <GridOnIcon />
          </ListItemIcon>
          Heatmap
        </MenuItem>
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
        <MenuItem aria-label='Edit' onClick={handleEditOpen}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem aria-label='Delete' onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  )
}

export default withRouter(MergeList)
