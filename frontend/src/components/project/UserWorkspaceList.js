import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Card, CardHeader, Typography, IconButton,
  CircularProgress, Menu, MenuItem, ListItemIcon, Button
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
  GridOn as GridOnIcon,
  MoreVert as MoreVertIcon,
  CloudDownload as CloudDownloadIcon
} from '@material-ui/icons'


import { exportWorkspace } from '../common/WorkspaceNavBar'
import { useMessageStateValue } from '../../store'

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
  history, userWorkspaces, openProjectCloneDialog, activeTemplate, projectId
}) => {

  const [menu, setMenu] = useState(null)
  const messageDispatch = useMessageStateValue()[1]

  const classes = useStyles()

  const handleNavigateMapper = (workspaceId) => {
    history.push(`/projects/${projectId}/workspaces/${workspaceId}/mapper`)
  }

  const handleNavigateHeatmap = () => {
    history.push(`/projects/${projectId}/workspaces/${menu.workspace.id}/heatmap`)
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

  return (
    <>
      <Card elevation={0} className={classes.root}>
        <CardHeader
          action={
            <Button
              variant='outlined' color='primary' aria-label='Invite students'
              onClick={openProjectCloneDialog} disabled={!activeTemplate}
            >
              Invite students
            </Button>
          }
          title='Workspaces by users'
        />
        <List dense={false}>
          {
            userWorkspaces ?
              userWorkspaces.map(workspace => (
                <ListItem
                  button key={workspace.id} onClick={() => handleNavigateMapper(workspace.id)}
                >
                  <ListItemText
                    primary={workspace.name}
                    secondary={workspace.participants.find(p => p.privilege === 'OWNER').user.id}
                  />

                  <ListItemSecondaryAction>
                    <IconButton
                      aria-owns={menu ? 'template-list-menu' : undefined}
                      onClick={evt => handleMenuOpen(workspace, evt)} aria-haspopup='true'>
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>


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
          <MenuItem aria-label='Export' onClick={handleWorkspaceExport}>
            <ListItemIcon>
              <CloudDownloadIcon />
            </ListItemIcon>
            Export
          </MenuItem>
        </Menu>
      </Card>
    </>
  )

}

export default withRouter(UserWorkspaceList)
