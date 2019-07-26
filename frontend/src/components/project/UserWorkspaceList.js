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
  Delete as DeleteIcon,
  GridOn as GridOnIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  ShowChart as ShowChartIcon,
  CloudDownload as CloudDownloadIcon
} from '@material-ui/icons'


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

const UserWorkspaceList = ({
  history, userWorkspaces, createProjectShareLink, deleteProjectShareLink
}) => {

  const [menu, setMenu] = useState(null)
  const { loggedIn } = useLoginStateValue()[0]
  const messageDispatch = useMessageStateValue()[1]

  const classes = useStyles()

  const handleNavigateMapper = (workspaceId) => {
    history.push(`/workspaces/${workspaceId}/mapper`)
  }

  const handleNavigateMatrix = () => {
    history.push(`/workspaces/${menu.workspace.id}/matrix`)
  }

  const handleNavigateHeatmap = () => {
    history.push(`/workspaces/${menu.workspace.id}/heatmap`)
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

  const handleDelete = async () => {
    handleMenuClose()
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
  }

  return (
    <>
      <Card elevation={0} className={classes.root}>
        <CardHeader
          action={
            loggedIn ?
              <IconButton aria-label='Add' onClick={() => { }}>
                <ShareIcon />
              </IconButton> : null
          }
          title={
            <Typography variant='h5' component='h3'>
              {'Workspaces by users'}
            </Typography>
          }
        />
        <List dense={false}>
          {
            userWorkspaces ?
              userWorkspaces.map(workspace => (
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
          <MenuItem aria-label='Delete' onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            Delete
          </MenuItem>
          <MenuItem aria-label='Edit' onClick={() => { }}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            Edit
          </MenuItem>
        </Menu>
      </Card>
    </>
  )

}

export default withRouter(UserWorkspaceList)
