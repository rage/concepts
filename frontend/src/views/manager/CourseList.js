import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Card, CardHeader, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction,
  TextField, Button, FormControlLabel, Checkbox, FormControl
} from '@material-ui/core'
import Select from 'react-select/creatable'
import { Delete as DeleteIcon, Edit as EditIcon, Lock as LockIcon } from '@material-ui/icons'

import { Role } from '../../lib/permissions'
import {
  backendToSelect, onTagCreate, selectToBackend, tagSelectStyles
} from '../../dialogs/tagSelectUtils'
import { useLoginStateValue } from '../../store'
import { useInfoBox } from '../../components/InfoBox'

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
  listItemDisabled: {
    color: 'rgba(0, 0, 0, 0.26)'
  },
  lockIcon: {
    visibility: 'hidden'
  },
  courseButton: {
    paddingRight: '104px',
    '&:hover $lockIcon': {
      visibility: 'visible'
    }
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
  workspace, setFocusedCourseId, focusedCourseId, createCourse, updateCourse, deleteCourse
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const listRef = useRef()
  const [editing, setEditing] = useState(null)
  const [{ user }] = useLoginStateValue()

  const isTemplate = Boolean(workspace.asTemplate && workspace.asTemplate.id)

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader title='Courses' />
      <List ref={listRef} className={classes.list}>{
        workspace.courses.map((course, index) => (
          <ListItem
            className={course.id === focusedCourseId ? classes.listItemActive :
              editing && editing !== course.id ? classes.listItemDisabled : null}
            button={editing !== course.id}
            classes={{ button: classes.courseButton }}
            ref={index === 0 ? infoBox.ref('manager', 'FOCUS_COURSE') : undefined}
            key={course.id}
            onClick={() => editing !== course.id && setFocusedCourseId(course.id)}
          >
            {editing === course.id ? <>
              <CreateCourse
                submit={args => {
                  setEditing(null)
                  updateCourse({ id: course.id, ...args })
                }}
                cancel={() => setEditing(null)}
                defaultValues={course}
                action='Save'
              />
            </> : <>
              <ListItemText primary={
                <Typography className={classes.courseName} variant='h6'>{course.name}</Typography>
              } />
              <ListItemSecondaryAction>
                {course.frozen && user.role < Role.STAFF && (
                  <IconButton disabled classes={{ root: classes.lockIcon }}>
                    <LockIcon />
                  </IconButton>
                )}
                {!course.frozen &&
                  <IconButton
                    color={editing ? 'inherit' : undefined} aria-label='Delete' onClick={evt => {
                      evt.stopPropagation()
                      const msg = `Are you sure you want to delete the course ${course.name}?`
                      if (window.confirm(msg)) {
                        deleteCourse(course.id)
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                {(!course.frozen || user.role >= Role.STAFF) &&
                  <IconButton
                    color={editing ? 'inherit' : undefined} aria-label='Edit' onClick={evt => {
                      evt.stopPropagation()
                      setEditing(course.id)
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                }
              </ListItemSecondaryAction>
            </>}
          </ListItem>
        ))
      }</List>
      <CreateCourse submit={async args => {
        await createCourse(args)
        listRef.current.scrollTop = listRef.current.scrollHeight
        infoBox.redrawIfOpen('manager',
          'CREATE_COURSE_NAME', 'CREATE_COURSE_THEMES', 'CREATE_COURSE_SUBMIT')
      }} defaultValues={{ official: isTemplate }} />
    </Card>
  )
}

const initialState = {
  name: '',
  official: undefined,
  frozen: undefined,
  tags: []
}

const CreateCourse = ({
  submit, defaultValues, action = 'Create', cancel
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const [{ user }] = useLoginStateValue()
  const nameRef = useRef()
  const [input, setInput] = useState({
    ...initialState,
    ...defaultValues,
    tags: defaultValues.tags ? backendToSelect(defaultValues.tags) : []
  })
  const [themeInput, setThemeInput] = useState('')

  const onSubmit = evt => {
    evt.preventDefault()
    submit({ ...input, tags: selectToBackend(input.tags) })
    if (action === 'Create') {
      nameRef.current.focus()
      setInput({ ...initialState, ...defaultValues })
      setThemeInput('')
    }
  }

  const onKeyDown = evt => {
    if (cancel && evt.key === 'Escape') {
      cancel()
    }
  }

  const handleKeyDownSelect = event => {
    if (!themeInput) return
    if (event.key === 'Tab' || event.key === 'Enter') {
      setInput({
        ...input,
        tags: [...input.tags, onTagCreate(themeInput)]
      })
      setThemeInput('')
      event.preventDefault()
    }
  }

  const selectRef = infoBox.ref('manager', 'CREATE_COURSE_THEMES')
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
        ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_COURSE_NAME') : undefined}
        autoFocus={action !== 'Create'}
        onChange={evt => setInput({ ...input, name: evt.target.value })}
      />
      <Select
        onChange={selected => setInput({ ...input, tags: selected || [] })}
        components={{
          DropdownIndicator: null
        }}
        onKeyDown={handleKeyDownSelect}
        onInputChange={value => setThemeInput(value)}
        styles={tagSelectStyles}
        value={input.tags}
        ref={elem => action === 'Create' && elem && elem.select && elem.select.select
          && selectRef(elem.select.select.controlRef)}
        isMulti
        menuPlacement='auto'
        placeholder='Themes...'
        menuIsOpen={false}
        menuPortalTarget={document.body}
        inputValue={themeInput}
      />
      <Button
        color='primary' variant='contained' disabled={!input.name} type='submit'
        ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_COURSE_SUBMIT') : undefined}
        className={classes.submit}
      >
        {action}
      </Button>
      {cancel &&
        <Button color='primary' variant='contained' onClick={cancel} className={classes.cancel}>
          Cancel
        </Button>
      }
      {user.role >= Role.STAFF && <>
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
        <FormControl style={{ verticalAlign: 'middle', marginLeft: '12px' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={input.frozen}
                onChange={evt => setInput({ ...input, frozen: evt.target.checked })}
                value='frozen'
                color='primary'
              />
            }
            label='Frozen'
          />
        </FormControl>
      </>}
    </form>
  )
}

export default CourseList
