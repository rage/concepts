import React from 'react'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Card, CardHeader, Typography, IconButton
} from '@material-ui/core'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons'

import { useMessageStateValue } from '../../store'
import { useCreateProjectDialog, useEditProjectDialog } from '../../dialogs/project'
import { DELETE_PROJECT } from '../../graphql/Mutation'
import { PROJECTS_FOR_USER } from '../../graphql/Query'
import useRouter from '../../useRouter'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'auto',
    gridArea: 'projects'
  },
  projectName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  projectButton: {
    paddingRight: '104px'
  },
  progress: {
    margin: theme.spacing(2)
  }
}))

const ProjectList = ({ projects }) => {
  const classes = useStyles()
  const { history } = useRouter()

  const [, messageDispatch] = useMessageStateValue()

  const openCreateProjectDialog = useCreateProjectDialog()
  const openEditProjectDialog = useEditProjectDialog()

  const deleteProject = useMutation(DELETE_PROJECT, {
    refetchQueries: [{
      query: PROJECTS_FOR_USER
    }]
  })

  const handleDelete = async (id) => {
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

  const handleNavigateProject = (projectId) => {
    history.push(`/projects/${projectId}/overview`)
  }

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        action={
          <IconButton aria-label='Add' onClick={openCreateProjectDialog}>
            <AddIcon />
          </IconButton>
        }
        title='Projects'
      />
      <List dense={false}>
        {
          projects.map(project => (
            <ListItem
              button key={project.id} onClick={() => handleNavigateProject(project.id)}
              classes={{ button: classes.projectButton }}
            >
              <ListItemText primary={
                <Typography className={classes.projectName} variant='h6'>{project.name}</Typography>
              } />
              <ListItemSecondaryAction>
                <IconButton aria-label='Delete' onClick={() => handleDelete(project.id)}>
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  aria-label='Edit' onClick={() => openEditProjectDialog(project.id, project.name)}
                >
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        }
      </List>
    </Card>
  )
}

export default ProjectList
