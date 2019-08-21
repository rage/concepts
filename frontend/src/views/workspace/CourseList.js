import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Card, CardHeader, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction,
  TextField, Button
} from '@material-ui/core'
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  list: {
    overflow: 'auto'
  },
  listItemActive: {
    boxShadow: `inset 3px 0px ${theme.palette.primary.dark}`
  },
  submit: {
    margin: theme.spacing(1, 0)
  },
  cancel: {
    margin: theme.spacing(1)
  },
  textfield: {
    margin: theme.spacing(1, 0)
  }
}))

const CourseList = ({
  courses, setFocusedCourseId, focusedCourseId, createCourse, updateCourse, deleteCourse
}) => {
  const classes = useStyles()
  const listRef = useRef()
  const [editing, setEditing] = useState(new Set())
  const startEditing = id => setEditing(new Set(editing).add(id))
  const stopEditing = id => {
    const copy = new Set(editing)
    copy.delete(id)
    setEditing(copy)
  }

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader title='Courses' />
      <List ref={listRef} className={classes.list}>{
        courses.map(course => (
          <ListItem
            className={course.id === focusedCourseId ? classes.listItemActive : null}
            button={!editing.has(course.id)}
            key={course.id}
            onClick={() => !editing.has(course.id) && setFocusedCourseId(course.id)}
          >
            {editing.has(course.id) ? <>
              <CreateCourse
                submit={name => {
                  stopEditing(course.id)
                  updateCourse(course.id, name)
                }}
                cancel={() => stopEditing(course.id)}
                defaultName={course.name}
                action='Save'
              />
            </> : <>
              <ListItemText primary={
                <Typography variant='h6'>{course.name}</Typography>
              } />
              <ListItemSecondaryAction>
                <IconButton aria-label='Delete' onClick={evt => {
                  evt.stopPropagation()
                  const msg = `Are you sure you want to delete the course ${course.name}?`
                  if (window.confirm(msg)) {
                    deleteCourse(course.id)
                  }
                }}>
                  <DeleteIcon />
                </IconButton>
                <IconButton aria-label='Edit' onClick={evt => {
                  evt.stopPropagation()
                  startEditing(course.id)
                }}>
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </>}
          </ListItem>
        ))
      }</List>
      <CreateCourse submit={async (...args) => {
        await createCourse(...args)
        listRef.current.scrollTop = listRef.current.scrollHeight
      }} />
    </Card>
  )
}

const CreateCourse = ({ submit, defaultName, action = 'Create', cancel }) => {
  const classes = useStyles()
  const nameRef = useRef()
  const [name, setName] = useState(defaultName || '')

  const onSubmit = evt => {
    evt.preventDefault()
    submit(name)
    if (action === 'Create') {
      nameRef.current.focus()
      setName('')
    }
  }

  const onKeyDown = evt => {
    if (cancel && evt.key === 'Escape') {
      cancel()
    }
  }

  return (
    <form onSubmit={onSubmit} onKeyDown={onKeyDown}>
      <TextField
        className={classes.textfield}
        variant='outlined'
        margin='dense'
        name='courseName'
        label='Course name'
        type='text'
        value={name}
        fullWidth
        inputRef={nameRef}
        autoFocus={action !== 'Create'}
        onChange={evt => setName(evt.target.value)}
      />
      <Button
        color='primary' variant='contained' disabled={!name} type='submit'
        className={classes.submit}
      >
        {action}
      </Button>
      {cancel &&
        <Button color='primary' variant='contained' onClick={cancel} className={classes.cancel}>
          Cancel
        </Button>
      }
    </form>
  )
}

export default CourseList
