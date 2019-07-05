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

import WorkspaceCreationDialog from './WorkspaceCreationDialog'
import WorkspaceEditingDialog from './WorkspaceEditingDialog'

// Error dispatcher
import { useErrorStateValue, useLoginStateValue } from '../../store'

import { useQuery } from 'react-apollo-hooks'
import {
  EXPORT_QUERY
} from '../../graphql/Query'

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

  const { loggedIn } = useLoginStateValue()[0]
  const errorDispatch = useErrorStateValue()[1]

  const exportWorkspaceQuery = useQuery(EXPORT_QUERY)

  const handleClickOpen = () => {
    if (!loggedIn) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateCreate({ open: true })
  }

  const handleClose = () => {
    setStateCreate({ open: false })
  }

  const handleEditOpen = (id, name) => () => {
    if (!loggedIn) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateEdit({ open: true, id, name })
  }

  const handleEditClose = () => {
    setStateEdit({ open: false, id: '', name: '' })
  }

  const handleDelete = (id) => async (e) => {
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
          variables: { id }
        })
      } catch (err) {
        errorDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
  }

  const handleNavigateMapper = (id) => () => {
    history.push(`/workspaces/${id}/mapper`)
  }
  const handleNavigateMatrix = (id) => () => {
    history.push(`/workspaces/${id}/matrix`)
  }

  const handleNavigateHeatmap = (id) => () => {
    history.push(`/workspaces/${id}/heatmap`)
  }


  return (
    <Grid container justify='center'>
      <Grid item md={8} xs={12}>
        <Card elevation={0} className={classes.root}>
          <CardHeader
            action={
              loggedIn ?
                <IconButton aria-label='Add' onClick={handleClickOpen}>
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
                  <ListItem button key={workspace.id} onClick={handleNavigateMapper(workspace.id)}>
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
                          <IconButton aria-label='Heatmap' onClick={handleNavigateHeatmap(workspace.id)}>
                            <ShowChartIcon/>
                          </IconButton>
                          <IconButton aria-label='Matrix' onClick={handleNavigateMatrix(workspace.id)}>
                            <GridOnIcon />
                          </IconButton>
                          <IconButton aria-label='Delete' onClick={handleDelete(workspace.id)}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton aria-label='Edit' onClick={handleEditOpen(workspace.id, workspace.name)}>
                            <EditIcon />
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
        </Card>
      </Grid>

      <WorkspaceCreationDialog state={stateCreate} handleClose={handleClose} createWorkspace={createWorkspace} />
      <WorkspaceEditingDialog state={stateEdit} handleClose={handleEditClose} updateWorkspace={updateWorkspace} defaultName={stateEdit.name} />
    </Grid>
  )
}

export default withRouter(withStyles(styles)(WorkspaceList))
