import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'

import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Card, CardHeader, Typography, IconButton,
  CircularProgress, Menu, MenuItem, ListItemIcon
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  GridOn as GridOnIcon,
  MoreVert as MoreVertIcon,
  ShowChart as ShowChartIcon,
  CloudDownload as CloudDownloadIcon
} from '@material-ui/icons'

import WorkspaceSharingDialog from '../workspace/WorkspaceSharingDialog'

import { exportWorkspace } from '../common/WorkspaceNavBar'

import { useMessageStateValue, useLoginStateValue } from '../../store'

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

const TemplateList = ({
  history, templateWorkspaces, deleteTemplate, createTemplate, updateTemplate,
  createShareLink, deleteShareLink, projectId
}) => {
  const classes = useStyles()
  const [stateCreate, setStateCreate] = useState({ open: false })
  const [stateEdit, setStateEdit] = useState({ open: false, id: '', name: '' })
  const [stateShare, setStateShare] = useState({ open: false, workspace: null })
  const [menu, setMenu] = useState(null)

  const { loggedIn } = useLoginStateValue()[0]
  const messageDispatch = useMessageStateValue()[1]

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

  const handleCreateOpen = () => {
    handleMenuClose()
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateCreate({ open: true })
  }

  // const handleCreateClose = () => {
  //   setStateCreate({ open: false })
  // }

  const handleEditOpen = () => {
    handleMenuClose()
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateEdit({ open: true, id: menu.workspace.id, name: menu.workspace.name })
  }

  // const handleEditClose = () => {
  //   setStateEdit({ open: false, id: '', name: '' })
  // }

  const handleShareOpen = () => {
    handleMenuClose()
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateShare({ open: true, id: menu.workspace.id })
  }

  const handleShareClose = () => {
    setStateShare({ open: false, id: null })
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

    const willDelete = window.confirm('Are you sure you want to delete this template?')
    if (willDelete) {
      try {
        await deleteTemplate({
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

  const handleNavigateMapper = (workspaceId) => {
    history.push(`/workspaces/${workspaceId}/mapper`)
  }

  const handleNavigateMatrix = () => {
    history.push(`/workspaces/${menu.workspace.id}/matrix`)
  }

  const handleNavigateHeatmap = () => {
    history.push(`/workspaces/${menu.workspace.id}/heatmap`)
  }


  return (
    <>
      <Card elevation={0} className={classes.root}>
        <CardHeader
          action={
            loggedIn ?
              <IconButton aria-label='Add' onClick={handleCreateOpen}>
                <AddIcon />
              </IconButton> : null
          }
          title={
            <Typography variant='h5' component='h3'>
              Workspaces
            </Typography>
          }
        />
        <List dense={false}>
          {
            templateWorkspaces ?
              templateWorkspaces.map(workspace => (
                <ListItem
                  button key={workspace.id} onClick={() => handleNavigateMapper(workspace.id)}
                >
                  <ListItemText
                    primary={
                      <Typography variant='h6'>
                        {workspace.name}
                      </Typography>
                    }
                  />
                  {
                    loggedIn ?
                      <ListItemSecondaryAction>
                        <IconButton
                          aria-owns={menu ? 'template-list-menu' : undefined}
                          onClick={evt => handleMenuOpen(workspace, evt)} aria-haspopup='true'>
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction> : null
                  }

                </ListItem>
              )) :
              <div style={{ textAlign: 'center' }}>
                <CircularProgress className={classes.progress} />
              </div>
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
          <MenuItem aria-label='Matrix' onClick={handleNavigateMatrix}>
            <ListItemIcon>
              <ShowChartIcon />
            </ListItemIcon>
            Matrix
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
      </Card>


      <WorkspaceSharingDialog
        open={stateShare.open} workspace={templateWorkspaces.find(ws => ws.id === stateShare.id)}
        handleClose={handleShareClose} createShareLink={createShareLink}
        deleteShareLink={deleteShareLink} />
    </>
  )
}

export default withRouter(TemplateList)
