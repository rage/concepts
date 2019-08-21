import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Card, CardHeader, Typography, IconButton,
  Menu, MenuItem, ListItemIcon
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, GridOn as GridOnIcon, Share as ShareIcon,
  MoreVert as MoreVertIcon, CloudDownload as CloudDownloadIcon, Shuffle as ShuffleIcon,
  RadioButtonChecked, RadioButtonUnchecked
} from '@material-ui/icons'

import { exportWorkspace } from './WorkspaceNavBar'
import { useMessageStateValue } from '../store'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    height: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    overflow: 'hidden',
    '&.mainWorkspaceList': {
      maxWidth: '720px',
      '@media screen and (max-width: 752px)': {
        width: 'calc(100% - 32px)'
      }
    },

    display: 'flex',
    flexDirection: 'column'
  },
  iconButton: {
    padding: '6px 12px 6px 12px'
  },
  list: {
    flex: 1,
    overflow: 'auto'
  },
  progress: {
    margin: theme.spacing(2)
  },
  templateActive: {
    boxShadow: `inset 3px 0px ${theme.palette.primary.dark}`
  }
}))

export const TYPE_MAIN = 'mainWorkspaceList'
export const TYPE_USER = 'userWorkspaceList'
export const TYPE_TEMPLATE = 'templateList'
export const TYPE_MERGE = 'mergeList'

const TYPE_NAMES = {
  [TYPE_MAIN]: 'workspace',
  [TYPE_USER]: 'user workspace',
  [TYPE_TEMPLATE]: 'template',
  [TYPE_MERGE]: 'merge'
}

const BaseWorkspaceList = ({
  history, type, workspaces, activeTemplate, projectId, urlPrefix,
  openCreateDialog, openEditDialog, openShareDialog, cardHeaderAction, cardHeaderTitle,
  deleteWorkspace, setActiveTemplate
}) => {
  const classes = useStyles()
  const [menu, setMenu] = useState({ open: false })
  const [, messageDispatch] = useMessageStateValue()

  const handleCreateOpen = () => {
    handleMenuClose()
    openCreateDialog()
  }

  cardHeaderAction = cardHeaderAction || (
    <IconButton className={classes.iconButton} aria-label='Add' onClick={handleCreateOpen}>
      <AddIcon />
    </IconButton>
  )

  const handleMenuOpen = (workspace, event) => {
    setMenu({
      anchor: event.currentTarget,
      open: true,
      workspace
    })
  }

  const handleMenuClose = () => {
    setMenu({
      ...menu,
      open: false
    })
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
    openEditDialog(menu.workspace.id, menu.workspace.name)
  }

  const handleShareOpen = () => {
    handleMenuClose()
    openShareDialog(menu.workspace.id, 'EDIT')
  }

  const handleDelete = async () => {
    handleMenuClose()

    const willDelete = window.confirm(`Are you sure you want to delete this ${TYPE_NAMES[type]}?`)
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

  const handleSetActive = async () => {
    handleMenuClose()

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

  const handleNavigateManager = (workspaceId) => {
    history.push(`${urlPrefix}/${workspaceId}/manager`)
  }

  const handleNavigateMapper = () => {
    history.push(`${urlPrefix}/${menu.workspace.id}/mapper`)
  }

  const handleNavigateHeatmap = () => {
    history.push(`${urlPrefix}/${menu.workspace.id}/heatmap`)
  }

  const isActiveTemplate = (menu.workspace && activeTemplate) &&
    menu.workspace.id === activeTemplate.id

  return (
    <Card elevation={0} className={`${classes.root} ${type}`}>
      <CardHeader action={cardHeaderAction} title={cardHeaderTitle} />
      <List dense={false} className={classes.list}>
        {
          workspaces.map(workspace => (
            <ListItem
              className={activeTemplate && workspace.id === activeTemplate.id
                ? classes.templateActive : ''}
              button key={workspace.id} onClick={() => handleNavigateManager(workspace.id)}
            >
              <ListItemText
                primary={<Typography variant='h6'>{workspace.name}</Typography>}
                secondary={type === TYPE_USER && workspace.participants
                  .find(p => p.privilege === 'OWNER').user.id}
              />

              <ListItemSecondaryAction>
                <IconButton onClick={evt => handleMenuOpen(workspace, evt)} aria-haspopup='true'>
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        }
      </List>
      <Menu anchorEl={menu.anchor} open={menu.open} onClose={handleMenuClose}>
        <MenuItem aria-label='Mapper' onClick={handleNavigateMapper}>
          <ListItemIcon>
            <ShuffleIcon />
          </ListItemIcon>
          Mapper
        </MenuItem>
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
        {
          type !== TYPE_USER &&
          <MenuItem aria-label='Share link' onClick={handleShareOpen}>
            <ListItemIcon>
              <ShareIcon />
            </ListItemIcon>
          Share link
          </MenuItem>
        }
        {
          type !== TYPE_USER && type === TYPE_TEMPLATE &&
            <MenuItem onClick={handleSetActive} disabled={isActiveTemplate}>
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

        }
        {
          type !== TYPE_USER &&
          <MenuItem aria-label='Edit' onClick={handleEditOpen}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            Edit
          </MenuItem>
        }
        {
          type !== TYPE_USER &&
          <MenuItem aria-label='Delete' onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            Delete
          </MenuItem>
        }
      </Menu>
    </Card>
  )
}

export default withRouter(BaseWorkspaceList)
