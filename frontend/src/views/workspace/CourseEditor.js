import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useMutation } from 'react-apollo-hooks'
import {
  Typography, Button, TextField, Paper, List, ListItem, ListItemText,
  IconButton, ListItemSecondaryAction
} from '@material-ui/core'
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons'

import { WORKSPACE_FOR_EDIT } from '../../graphql/Query'
import { CREATE_COURSE } from '../../graphql/Mutation'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  list: {
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
    flex: 1
  },
  listSection: {
    backgroundColor: 'inherit'
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0
  }
}))

const CourseEditor = ({ workspaceId, courseInEdit }) => {
  const classes = useStyles()

  const createCourse = useMutation(CREATE_COURSE, {
    refetchQueries: [{
      query: WORKSPACE_FOR_EDIT, variables: { id: workspaceId }
    }]
  })

  const [input, setInput] = useState({
    courseName: '',
    conceptName: '',
    conceptDescription: '',
    conceptTag: ''
  })

  const [editingCourse, setEditingCourse] = useState(false)

  return (
    <Paper elevation={0} className={classes.root}>
      {
        !editingCourse ?
          !courseInEdit ?
            <Button
              color='primary'
              variant='contained'
              onClick={() => setEditingCourse(true)}
            >
              Add course
            </Button>
            :
            <Typography variant='h5'>{courseInEdit.name}</Typography>
          :
          <CreateCourse closeForm={() => setEditingCourse(false)} />
      }
      {
        courseInEdit ?
          <>
            <div className={classes.conceptList}>
              <List>
                {
                  courseInEdit.concepts.map(concept => (
                    <ListItem
                      divider
                      key={concept.id}
                    >
                      <ListItemText
                        primary={
                          <Typography variant='h6'>
                            {concept.name}
                          </Typography>
                        }
                      />
                      {
                        <ListItemSecondaryAction>
                          <IconButton aria-label='Delete' onClick={() => { }}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton aria-label='Edit' onClick={() => { }}>
                            <EditIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      }
                    </ListItem>
                  ))
                }
              </List>
            </div>
            <div className={classes.conceptForm}>
              <TextField
                variant='outlined'
                margin='dense'
                id='conceptName'
                name='conceptName'
                label='Concept name'
                type='text'
                value={input.conceptName}
                fullWidth
                onChange={(e) => setInput({ ...input, [e.target.name]: e.target.value })}
              />
              <TextField
                variant='outlined'
                margin='dense'
                id='conceptDescription'
                name='conceptDescription'
                label='Concept description'
                type='text'
                value={input.conceptDescription}
                fullWidth
                onChange={(e) => setInput({ ...input, [e.target.name]: e.target.value })}
              />
              <Button
                color='primary'
                variant='contained'
              >
                Create
              </Button>
            </div>
          </>
          : null
      }
    </Paper>
  )
}

const CreateCourse = ({ closeForm }) => {
  const [name, setName] = useState('')
  return (
    <div>
      <TextField
        style={{ marginBottom: '8px' }}
        variant='outlined'
        margin='dense'
        id='courseName'
        name='courseName'
        label='Course name'
        type='text'
        value={name}
        fullWidth
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        style={{ marginRight: '10px' }}
        color='primary'
        variant='contained'
        onClick={closeForm}
      >
        Create
      </Button>
      <Button
        color='primary'
        variant='contained'
        onClick={closeForm}
      >
        Close
      </Button>
    </div>
  )
}

export default CourseEditor
