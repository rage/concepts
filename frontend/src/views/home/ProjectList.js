import React from 'react'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Card, CardHeader, Typography, IconButton,
  CircularProgress
} from '@material-ui/core'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons'

import { useMessageStateValue, useLoginStateValue } from '../../store'
import { useCreateProjectDialog, useEditProjectDialog } from '../../dialogs/project'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    maxWidth: '720px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    overflow: 'visible',
    '@media screen and (max-width: 752px)': {
      width: 'calc(100% - 32px)'
    }
  },
  progress: {
    margin: theme.spacing(2)
  }
}))

const ProjectList = ({ history, projects, deleteProject }) => {
  const classes = useStyles()

  const { loggedIn } = useLoginStateValue()[0]
  const messageDispatch = useMessageStateValue()[1]

  const openCreateProjectDialog = useCreateProjectDialog()
  const openEditProjectDialog = useEditProjectDialog()

  const handleClickOpen = () => {
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    openCreateProjectDialog()
  }

  const handleEditOpen = (id, name) => {
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    openEditProjectDialog(name, id)
  }

  const handleDelete = async (id) => {
    if (!loggedIn) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }

    const willDelete = window.confirm('Are you sure you want to delete this project?')
    if (willDelete) {
      try {
        await deleteProject({
          variables: { id }
        })
      } catch (err) {
        messageDispatch({
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
    <>
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
                  />
                  {
                    loggedIn ?
                      <ListItemSecondaryAction>
                        <IconButton aria-label='Delete' onClick={() => handleDelete(project.id)}>
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          aria-label='Edit' onClick={() => handleEditOpen(project.id, project.name)}
                        >
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
    </>
  )
}

export default withRouter(ProjectList)
