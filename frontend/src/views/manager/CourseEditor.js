import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Button, TextField, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction,
  Card, CardHeader, Tooltip, Fade, MenuItem, FormControlLabel, Checkbox, FormControl
} from '@material-ui/core'
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons'

import TaxonomyTags from '../../dialogs/concept/TaxonomyTags'
import MergeDialog from './MergeDialog'
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
  headerContent: {
    minWidth: 0
  },
  header: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
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
  conceptBody: {
    paddingRight: '104px'
  },
  conceptName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  textfield: {
    margin: theme.spacing(1, 0)
  },
  tooltip: {
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 16,
    margin: '2px'
  },
  popper: {
    padding: '5px'
  }
}))

const CourseEditor = ({ workspaceId, course, createConcept, updateConcept, deleteConcept }) => {
  const classes = useStyles()
  const listRef = useRef()
  const [editing, setEditing] = useState(new Set())
  const [merging, setMerging] = useState(null)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const startEditing = id => setEditing(new Set(editing).add(id))
  const stopAllEditing = () => setEditing(new Set())
  const stopEditing = id => {
    const copy = new Set(editing)
    copy.delete(id)
    setEditing(copy)
  }

  const startMerging = () => {
    stopAllEditing()
    setMerging(new Set())
  }
  const toggleMergingConcept = id => {
    const copy = new Set(merging)
    if (copy.has(id)) {
      copy.delete(id)
    } else {
      copy.add(id)
    }
    setMerging(copy)
  }

  const stopMerging = () => setMerging(null)
  const openMergeDialog = () => setMergeDialogOpen(true)
  const closeMergeDialog = () => setMergeDialogOpen(false)

  useEffect(() => () => {
    stopAllEditing()
    stopMerging()
    closeMergeDialog()
  }, [course])

  const cardHeaderButton = (text, onClick, disabled = false) => (
    <Button
      key={text}
      style={{ margin: '6px' }}
      variant='outlined' color='primary'
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {text}
    </Button>
  )

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        classes={{ title: classes.header, content: classes.headerContent }}
        title={`Concepts of ${course.name}`}
        action={
          merging ? [
            cardHeaderButton('Merge…', () => openMergeDialog(), merging.size < 2),
            cardHeaderButton('Cancel', () => stopMerging())
          ] : [
            cardHeaderButton('Start merge', () => startMerging())
          ]
        }
      />
      {mergeDialogOpen && <MergeDialog
        workspaceId={workspaceId} courseId={course.id} conceptIds={merging} close={closeMergeDialog}
      /> }
      <List ref={listRef} className={classes.list}>{
        course.concepts.map(concept => (
          <Tooltip
            key={concept.id}
            placement='top'
            classes={{
              tooltip: classes.tooltip,
              popper: classes.popper
            }}
            TransitionComponent={Fade}
            title={editing.has(concept.id) ? '' : concept.description || 'No description available'}
          >
            <ListItem divider key={concept.id}>
              {editing.has(concept.id) ? (
                <CreateConcept
                  submit={args => {
                    stopEditing(concept.id)
                    updateConcept({ id: concept.id, ...args })
                  }}
                  cancel={() => stopEditing(concept.id)}
                  defaultValues={concept}
                  action='Save'
                />
              ) : <>
                <ListItemText className={classes.conceptBody} primary={
                  <Typography className={classes.conceptName} variant='h6'>
                    {concept.name}
                  </Typography>
                } />
                <ListItemSecondaryAction>
                  {merging ? (
                    <Checkbox
                      checked={merging.has(concept.id)}
                      onClick={() => toggleMergingConcept(concept.id)}
                      color='primary'
                    />
                  ) : <>
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
                  </>}
                </ListItemSecondaryAction>
              </>}
            </ListItem>
          </Tooltip>
        ))
      }</List>
      <CreateConcept submit={async args => {
        await createConcept(args)
        listRef.current.scrollTop = listRef.current.scrollHeight
      }} />
    </Card>
  )
}

const initialState = {
  name: '',
  description: '',
  tags: [],
  bloomTag: '',
  official: false
}

const CreateConcept = ({ submit, defaultValues, action = 'Create', cancel }) => {
  const classes = useStyles()
  const [{ user }] = useLoginStateValue()
  const nameRef = useRef()
  const localInitialState = { ...initialState, ...defaultValues }
  const [input, setInput] = useState({
    ...localInitialState,
    tags: localInitialState.tags.filter(tag => tag.type !== 'bloom'),
    bloomTag: (localInitialState.tags.find(tag => tag.type === 'bloom') || {}).name || ''
  })

  const onSubmit = evt => {
    evt.preventDefault()
    if (input.bloomTag) {
      input.tags.push({ type: 'bloom', name: input.bloomTag })
    }
    delete input.bloomTag
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
      {
        user.role === 'STAFF' ?
          <FormControl fullWidth>
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
          : null
      }
      <TextField
        select
        variant='outlined'
        className={classes.textfield}
        label="Select Bloom's tags"
        fullWidth
        value={input.bloomTag}
        name='bloomTag'
        onChange={onChange}
        margin='dense'
      >
        <MenuItem value=''>None</MenuItem>
        {TaxonomyTags.map(data => {
          if (typeof value === 'string') {
            data = { value: data }
          }
          return (
            <MenuItem key={data.value} value={data.value}>
              {data.label || data.value}
            </MenuItem>
          )
        })}
      </TextField>
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
