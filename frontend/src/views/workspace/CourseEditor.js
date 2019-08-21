import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Button, TextField, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction,
  Card, CardHeader
} from '@material-ui/core'
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons'

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

const CourseEditor = ({ course, createConcept, updateConcept, deleteConcept }) => {
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
      <CardHeader title={`Concepts of ${course.name}`} />
      <List ref={listRef} className={classes.list}>{
        course.concepts.map(concept => (
          <ListItem divider key={concept.id}>
            {editing.has(concept.id) ? <>
              <CreateConcept
                submit={args => {
                  stopEditing(concept.id)
                  updateConcept({ id: concept.id, ...args })
                }}
                cancel={() => stopEditing(concept.id)}
                defaultValues={concept}
                action='Save'
              />
            </> : <>
              <ListItemText primary={
                <Typography variant='h6'>{concept.name}</Typography>
              } />
              <ListItemSecondaryAction>
                <IconButton aria-label='Delete' onClick={() => {
                  const msg = `Are you sure you want to delete the concept ${concept.name}?`
                  if (window.confirm(msg)) {
                    deleteConcept(concept.id)
                  }
                }}>
                  <DeleteIcon />
                </IconButton>
                <IconButton aria-label='Edit' onClick={() => startEditing(concept.id)}>
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </>}
          </ListItem>
        ))
      }</List>
      <CreateConcept submit={async (...args) => {
        await createConcept(...args)
        listRef.current.scrollTop = listRef.current.scrollHeight
      }} />
    </Card>
  )
}

const initialState = {
  name: '',
  description: '',
  tag: '',
  official: false
}

const CreateConcept = ({ submit, defaultValues, action = 'Create', cancel }) => {
  const classes = useStyles()
  const nameRef = useRef()
  const [input, setInput] = useState({ ...initialState, ...defaultValues })

  const onSubmit = evt => {
    evt.preventDefault()
    submit(input)
    if (action === 'Create') {
      nameRef.current.focus()
      setInput({ ...initialState })
    }
  }

  const onKeyDown = evt => {
    if (cancel && evt.key === 'Escape') {
      cancel()
    }
  }

  const onChange = evt => setInput({ ...input, [evt.target.name]: evt.target.value })

  return (
    <form onSubmit={onSubmit} onKeyDown={onKeyDown}>
      <TextField
        className={classes.textfield}
        variant='outlined'
        margin='dense'
        name='name'
        label='Concept name'
        type='text'
        value={input.name}
        fullWidth
        inputRef={nameRef}
        autoFocus={action !== 'Create'}
        onChange={onChange}
      />
      <TextField
        className={classes.textfield}
        variant='outlined'
        margin='dense'
        name='description'
        label='Concept description'
        type='text'
        value={input.description}
        fullWidth
        onChange={onChange}
      />
      <Button
        color='primary' variant='contained' disabled={!input.name} type='submit'
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

export default CourseEditor
