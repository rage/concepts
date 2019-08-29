import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Card, CardHeader, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction,
  TextField, Button, FormControlLabel, Checkbox, FormControl
} from '@material-ui/core'
import Select from 'react-select/creatable'
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons'

import { backendToSelect, onTagCreate, selectToBackend, tagSelectStyles } from '../../dialogs/concept/tagSelectUtils'
import { useLoginStateValue } from '../../store'

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
  courseButton: {
    paddingRight: '104px'
  },
  courseName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  submit: {
    margin: theme.spacing(1, 0)
  },
  cancel: {
    margin: theme.spacing(1, 0, 1, 1)
  },
  textfield: {
    margin: theme.spacing(1, 0)
  },
  form: {
    width: '100%'
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
            classes={{ button: classes.courseButton }}
            key={course.id}
            onClick={() => !editing.has(course.id) && setFocusedCourseId(course.id)}
          >
            {editing.has(course.id) ? <>
              <CreateCourse
                submit={args => {
                  stopEditing(course.id)
                  updateCourse({ id: course.id, ...args })
                }}
                cancel={() => stopEditing(course.id)}
                defaultName={course.name}
                defaultOfficial={course.official}
                defaultTags={course.tags}
                action='Save'
              />
            </> : <>
              <ListItemText primary={
                <Typography className={classes.courseName} variant='h6'>{course.name}</Typography>
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
      <CreateCourse submit={async args => {
        await createCourse(args)
        listRef.current.scrollTop = listRef.current.scrollHeight
      }} />
    </Card>
  )
}

const CreateCourse = ({ submit, defaultName, defaultOfficial, defaultTags, action = 'Create', cancel }) => {
  const classes = useStyles()
  const [{ user }] = useLoginStateValue()
  const nameRef = useRef()
  const [input, setInput] = useState({
    name: defaultName || '',
    official: defaultOfficial || false,
    tags: defaultTags ? backendToSelect(defaultTags) : [],
    themeInput: ''
  })

  const onSubmit = evt => {
    evt.preventDefault()
    submit(input)
    if (action === 'Create') {
      nameRef.current.focus()
      setInput({ name: '', official: false })
    }
  }

  const onKeyDown = evt => {
    if (cancel && evt.key === 'Escape') {
      cancel()
    }
  }

  const handleKeyDownSelect = event => {
    const option = input.themeInput
    if (!option) return
    switch (event.key) {
    case 'Enter':
    case 'Tab':
      setInput({
        ...input,
        themeInput: '',
        tags: [...input.tags, onTagCreate(option)]
      })
      event.preventDefault()
    }
  }

  return (
    <form className={classes.form} onSubmit={onSubmit} onKeyDown={onKeyDown}>
      <TextField
        className={classes.textfield}
        variant='outlined'
        margin='dense'
        name='courseName'
        label='Course name'
        type='text'
        value={input.name}
        fullWidth
        inputRef={nameRef}
        autoFocus={action !== 'Create'}
        onChange={evt => setInput({ ...input, name: evt.target.value })}
      />
      <Select
        onChange={selected => setInput({ ...input, tags: selected })}
        components={{
          DropdownIndicator: null
        }}
        onKeyDown={handleKeyDownSelect}
        onInputChange={value => setInput({ ...input, themeInput: value })}
        styles={tagSelectStyles}
        value={input.tags}
        isMulti={true}
        menuPlacement='auto'
        placeholder='Themes...'
        menuIsOpen={false}
        menuPortalTarget={document.body}
        inputValue={input.themeInput}
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
      { user.role === 'STAFF' &&
        <FormControl style={{ verticalAlign: 'middle', marginLeft: '12px' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={input.official}
                onChange={evt => setInput({ ...input, official: evt.target.checked })}
                value='official'
                color='primary'
              />
            }
            label='Official'
          />
        </FormControl>
      }
    </form>
  )
}

export default CourseList
