import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Button, TextField, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction,
  Card, CardHeader, Tooltip, Fade, FormControlLabel, Checkbox, FormControl, ButtonGroup, Popper, Grow,
  MenuList, MenuItem, ClickAwayListener, Paper
} from '@material-ui/core'
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons'
import  ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import Select from 'react-select/creatable'

import TaxonomyTags from '../../dialogs/concept/TaxonomyTags'
import MergeDialog from './MergeDialog'
import { useLoginStateValue } from '../../store'
import {
  backendToSelect, onTagCreate, selectToBackend, tagSelectStyles
} from '../../dialogs/concept/tagSelectUtils'

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
  },
  rowButton: {
    width: '33%',
    marginRight: '2px'
  }
}))

const CourseEditor = ({ workspaceId, course, createConcept, updateConcept, deleteConcept }) => {
  const classes = useStyles()
  const listRef = useRef()
  const [editing, setEditing] = useState(new Set())
  const [merging, setMerging] = useState(null)
  const mergeDialogTimeout = useRef(-1)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(null)
  const startEditing = id => setEditing(new Set(editing).add(id))
  const stopAllEditing = () => setEditing(new Set())
  const [conceptFilter, setConceptFilter] = useState('')

  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [sortItemIndex, setSortItemIndex] = useState(0)
  const sortAnchorRef = useRef(null)
  const sortingOptions = ['alphabetical', 'creation']

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
  const openMergeDialog = () => {
    clearTimeout(mergeDialogTimeout.current)
    setMergeDialogOpen({ open: true })
  }
  const closeMergeDialog = () => {
    setMergeDialogOpen({ open: false })
    mergeDialogTimeout.current = setTimeout(() => setMergeDialogOpen(null), 500)
  }

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

  const setSelectedSortingIndex = (event, index) => {
    setSortItemIndex(index)
    setSortMenuOpen(false)
  }

  const openSortMenu = () => {
    setSortMenuOpen(true)
  }

  const closeSortMenu = (event) => {
    if (sortAnchorRef.current && sortAnchorRef.current.contains(event.target)) {
      return
    }
    setSortMenuOpen(false)
  }

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
            cardHeaderButton('Start merge', () => startMerging(), course.concepts.length < 2)
          ]
        }
      />

      <TextField style={{ marginBottom: '6px' }}
        value={conceptFilter}
        onChange={evt => setConceptFilter(evt.target.value)} placeholder='Filter concepts...' />

      <div>
        <Button size='small' variant='outlined' className={classes.rowButton}>Duplicate </Button>
        <Button size='small' variant='outlined' className={classes.rowButton}>New </Button>
        <ButtonGroup ref={sortAnchorRef} size='small' style={{ width: '33%' }}>
          <Button size='small' style={{ width: '80%' }}>{sortingOptions[sortItemIndex]} </Button>
          <Button onClick={openSortMenu}
            size='small'
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
      </div>

      <Popper style={{ zIndex: 2 }} open={sortMenuOpen} anchorEl={sortAnchorRef.current} transition disablePortal>
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            placement='bottom'
          >
            <Paper id='menu-list-grow'>
              <ClickAwayListener onClickAway={closeSortMenu}>
                <MenuList>
                  {sortingOptions.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === sortItemIndex}
                      onClick={event => setSelectedSortingIndex(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {mergeDialogOpen !== null && <MergeDialog
        workspaceId={workspaceId} courseId={course.id} conceptIds={merging} close={closeMergeDialog}
        open={mergeDialogOpen.open}
      /> }
      <List ref={listRef} className={classes.list}>{
        course.concepts.map(concept => {
          if (conceptFilter.length === 0 ||
              concept.name.toLowerCase().includes(conceptFilter.toLowerCase())) {
            return (<Tooltip
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
            </Tooltip>)
          } else {
            return null
          }
        })
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

const CreateConcept = ({ submit, defaultValues = {}, action = 'Create', cancel }) => {
  const classes = useStyles()
  const [{ user }] = useLoginStateValue()
  const nameRef = useRef()
  const [input, setInput] = useState({
    ...initialState,
    ...defaultValues,
    tags: defaultValues.tags ? backendToSelect(defaultValues.tags) : []
  })

  const onSubmit = evt => {
    evt.preventDefault()
    delete input.bloomTag
    submit({
      ...input,
      tags: selectToBackend(input.tags)
    })
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
      <Select
        onChange={selected => setInput({ ...input, tags: selected })}
        onCreateOption={newOption => setInput({
          ...input,
          tags: [...input.tags, onTagCreate(newOption)]
        })}
        styles={tagSelectStyles}
        options={Object.values(TaxonomyTags)}
        value={input.tags}
        isMulti={true}
        menuPlacement='auto'
        menuPortalTarget={document.body}
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
