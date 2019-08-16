import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Card, CardHeader, Typography, IconButton,
  Menu, MenuItem, ListItemIcon
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  GridOn as GridOnIcon,
  MoreVert as MoreVertIcon,
  CloudDownload as CloudDownloadIcon,
  RadioButtonChecked,
  RadioButtonUnchecked
} from '@material-ui/icons'

import { exportWorkspace } from '../../components/WorkspaceNavBar'
import { useMessageStateValue, useLoginStateValue } from '../../store'
import { useEditTemplateDialog, useCreateTemplateDialog } from '../../dialogs/project'
import { useShareDialog } from '../../dialogs/sharing'

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
  },
  listItemActive: {
    boxShadow: `inset 3px 0px ${theme.palette.primary.dark}`
  }
}))

const TemplateList = ({
  history, templateWorkspaces, deleteTemplateWorkspace,
  projectId, activeTemplate, setActiveTemplate
}) => {
  const classes = useStyles()
  const [menu, setMenu] = useState({ open: false })

  const { loggedIn } = useLoginStateValue()[0]
  const messageDispatch = useMessageStateValue()[1]

  const openEditTemplateDialog = useEditTemplateDialog(projectId)
  const openCreateTemplateDialog = useCreateTemplateDialog(projectId)
  const openShareWorkspaceDialog = useShareDialog('workspace')

  const handleMenuOpen = (workspace, event) => {
    setMenu({
      anchor: event.currentTarget,
      open: true,
      workspace
    })
  }

  const handleMenuClose = () => {
    setMenu({ ...menu, open: false })
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
    openCreateTemplateDialog()
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
    openEditTemplateDialog(menu.workspace.id, menu.workspace.name)
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
    const willDelete = window.confirm('Are you sure you want to delete this template?')
    if (willDelete) {
      try {
        await deleteTemplateWorkspace({
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

  const handleSetActive = async () => {
    handleMenuClose()
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    if (activeTemplate && menu.workspace.id !== activeTemplate.id) {
      const change = window.confirm(
        `Are you sure that you want to switch the active template? 
This will change which template is cloned by users.`)
      if (!change) return
    }
    try {
      await setActiveTemplate({
        variables: { projectId, workspaceId: menu.workspace.id }
      })
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: err.message
      })
    }
  }

  const handleNavigateMapper = (workspaceId) => {
    history.push(`/projects/${projectId}/templates/${workspaceId}/mapper`)
  }

  const handleNavigateHeatmap = () => {
    history.push(`/projects/${projectId}/templates/${menu.workspace.id}/heatmap`)
  }

  const isActiveTemplate = (menu.workspace && activeTemplate) &&
    menu.workspace.id === activeTemplate.id

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        action={
          loggedIn ?
            <IconButton aria-label='Add' onClick={handleCreateOpen}>
              <AddIcon />
            </IconButton> : null
        }
        title='Template workspaces'

      />
      <List dense={false}>
        {
          templateWorkspaces.map(workspace => (
            <ListItem
              className={(activeTemplate) && workspace.id === activeTemplate.id ?
                classes.listItemActive
                : null}
              button
              key={workspace.id}
              onClick={() => handleNavigateMapper(workspace.id)}
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
          ))
        }
      </List>
      <Menu
        id='template-list-menu' anchorEl={menu ? menu.anchor : undefined} open={menu.open}
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
        <MenuItem aria-label='Set as active' onClick={handleSetActive} disabled={isActiveTemplate}>
          <ListItemIcon>
            {
              isActiveTemplate ?
                <RadioButtonChecked />
                :
                <RadioButtonUnchecked />
            }
          </ListItemIcon>
          {!isActiveTemplate ? 'Set as' : 'Is'} active
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

export default withRouter(TemplateList)
