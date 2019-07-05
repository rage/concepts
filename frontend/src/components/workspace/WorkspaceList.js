import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import GridOnIcon from '@material-ui/icons/GridOn'
import ShowChartIcon from '@material-ui/icons/ShowChart'
import CircularProgress from '@material-ui/core/CircularProgress'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'

import WorkspaceCreationDialog from './WorkspaceCreationDialog'
import WorkspaceEditingDialog from './WorkspaceEditingDialog'

// Error dispatcher
import { useErrorStateValue, useLoginStateValue } from '../../store'

const styles = theme => ({
  root: {
    ...theme.mixins.gutters()
  },
  progress: {
    margin: theme.spacing(2)
  }
})

const WorkspaceList = ({ classes, history, workspaces, deleteWorkspace, createWorkspace, updateWorkspace }) => {
  const [stateCreate, setStateCreate] = useState({ open: false })
  const [stateEdit, setStateEdit] = useState({ open: false, id: '', name: '' })
  const [menu, setMenu] = useState(null)

  const { loggedIn } = useLoginStateValue()[0]
  const errorDispatch = useErrorStateValue()[1]

  const handleMenuOpen = (workspace, event) => {
    setMenu({
      anchor: event.currentTarget,
      workspace
    })
  }

  const handleMenuClose = () => {
    setMenu(null)
  }

  const handleCreateOpen = () => {
    if (!loggedIn) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateCreate({ open: true })
  }

  const handleCreateClose = () => {
    setStateCreate({ open: false })
  }

  const handleEditOpen = () => {
    handleMenuClose()
    if (!loggedIn) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateEdit({ open: true, id: menu.workspace.id, name: menu.workspace.name })
  }

  const handleEditClose = () => {
    setStateEdit({ open: false, id: '', name: '' })
  }

  const handleDelete = async () => {
    handleMenuClose()
    if (!loggedIn) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }

    const willDelete = window.confirm('Are you sure you want to delete this workspace?')
    if (willDelete) {
      try {
        await deleteWorkspace({
          variables: { id: menu.workspace.id }
        })
      } catch (err) {
        errorDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
  }

  const handleNavigateMapper = () => {
    history.push(`/workspaces/${menu.workspace.id}/mapper`)
  }

  const handleNavigateMatrix = () => {
    history.push(`/workspaces/${menu.workspace.id}/matrix`)
  }

  const handleNavigateHeatmap = () => {
    history.push(`/workspaces/${menu.workspace.id}/heatmap`)
  }


  return (
    <Grid container justify='center'>
      <Grid item md={8} xs={12}>
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
              workspaces ?
                workspaces.map(workspace => (
                  <ListItem button key={workspace.id} onClick={handleNavigateMapper}>
                    <ListItemText
                      primary={
                        <Typography variant='h6'>
                          {workspace.name}
                        </Typography>
                      }
                      secondary={workspace.owner.id}
                    />
                    {
                      loggedIn ?
                        <ListItemSecondaryAction>
                          <IconButton
                            aria-owns={menu ? 'workspace-list-menu' : undefined}
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
            id='workspace-list-menu' anchorEl={menu ? menu.anchor : undefined} open={Boolean(menu)}
            onClose={handleMenuClose}
          >
            <MenuItem aria-label='Heatmap' onClick={handleNavigateHeatmap}>
              <ListItemIcon>
                <ShowChartIcon/>
              </ListItemIcon>
              Heatmap
            </MenuItem>
            <MenuItem aria-label='Matrix' onClick={handleNavigateMatrix}>
              <ListItemIcon>
                <GridOnIcon />
              </ListItemIcon>
              Matrix
            </MenuItem>
            <MenuItem aria-label='Export' onClick={() => alert("handleExport is not defined")}>
              <ListItemIcon>
                <CloudDownloadIcon/>
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
        </Card>
      </Grid>

      <WorkspaceCreationDialog
        state={stateCreate} handleClose={handleCreateClose}createWorkspace={createWorkspace} />
      <WorkspaceEditingDialog
        state={stateEdit} handleClose={handleEditClose} updateWorkspace={updateWorkspace}
        defaultName={stateEdit.name} />
    </Grid>
  )
}

export default withRouter(withStyles(styles)(WorkspaceList))
