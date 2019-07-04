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
import CircularProgress from '@material-ui/core/CircularProgress'

import ProjectCreationDialog from './ProjectCreationDialog'
import ProjectEditingDialog from './ProjectEditingDialog'

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

const ProjectList = ({ classes, history, projects, deleteProject, createProject, updateProject }) => {
  const [stateCreate, setStateCreate] = useState({ open: false })
  const [stateEdit, setStateEdit] = useState({ open: false, id: '', name: '' })

  const { loggedIn } = useLoginStateValue()[0]
  const errorDispatch = useErrorStateValue()[1]

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

    let willDelete = window.confirm('Are you sure you want to delete this project?')
    if (willDelete) {
      try {
        await deleteProject({
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

  const handleNavigateProject = (projectId) => () => {
    history.push(`/projects/${projectId}`)
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
                Projects
              </Typography>
            }
          />
          <List dense={false}>
            {
              projects ?
                projects.map(project => (
                  <ListItem button key={project.id} onClick={handleNavigateProject(project.id)}>
                    <ListItemText
                      primary={
                        <Typography variant='h6'>
                          {project.name}
                        </Typography>
                      }
                      secondary={project.owner.id}
                    />
                    {
                      loggedIn ?
                        <ListItemSecondaryAction>
                          <IconButton aria-label='Delete' onClick={handleDelete(project.id)}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton aria-label='Edit' onClick={handleEditOpen(project.id, project.name)}>
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

      <ProjectCreationDialog state={stateCreate} handleClose={handleClose} createProject={createProject} />
      <ProjectEditingDialog state={stateEdit} handleClose={handleEditClose} updateProject={updateProject} defaultName={stateEdit.name} />
    </Grid>
  )
}

export default withRouter(withStyles(styles)(ProjectList))
