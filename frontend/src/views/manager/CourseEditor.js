import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Button, TextField, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction,
  Card, CardHeader, Tooltip, Fade, FormControlLabel, Checkbox, FormControl, MenuItem
} from '@material-ui/core'
import { Edit as EditIcon, Delete as DeleteIcon, Lock as LockIcon } from '@material-ui/icons'
import Select from 'react-select/creatable'

import TaxonomyTags from '../../dialogs/concept/TaxonomyTags'
import MergeDialog from './MergeDialog'
import { useLoginStateValue } from '../../store'
import {
  backendToSelect, onTagCreate, selectToBackend, tagSelectStyles
} from '../../dialogs/concept/tagSelectUtils'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(), width: '100%',
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
  filterBar: {
    display: 'flex',
    marginBottom: '8px'
  },
  filterText: {
    flex: 1,
    marginRight: '8px'
  },
  list: {
    overflow: 'auto'
  },
  listItemContainer: {
    '&:hover $lockIcon': {
      visibility: 'visible'
    }
  },
  lockIcon: {
    visibility: 'hidden'
  },
  submit: {
    margin: theme.spacing(1, 0)
  },
  cancel: {
    margin: theme.spacing(1, 0, 1, 1)
  },
  conceptBody: {
    paddingRight: '104px'
  },
  conceptName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  listItemDisabled: {
    color: 'rgba(0, 0, 0, 0.26)'
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
  },
  form: {
    width: '100%'
  }
}))

const sortingOptions = {
  ALPHABETICAL_ASC: 'Alphabetical (A-Z)',
  ALPHABETICAL_DESC: 'Alphabetical (Z-A)',
  CREATION_ASC: 'Creation date (oldest first)',
  CREATION_DESC: 'Creation date (newest first)'
}

const CourseEditor = ({ workspaceId, course, createConcept, updateConcept, deleteConcept }) => {
  const classes = useStyles()
  const [{ user }] = useLoginStateValue()
  const listRef = useRef()
  const [editing, setEditing] = useState(null)
  const [merging, setMerging] = useState(null)
  const mergeDialogTimeout = useRef(-1)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(null)
  const [conceptFilter, setConceptFilter] = useState('')

  const [sortMethod, setSortMethod] = useState('CREATION_ASC')

  const startMerging = () => {
    setEditing(null)
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
    setEditing(null)
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

  const sort = (concepts) => {
    switch (sortMethod) {
    case 'ALPHABETICAL_ASC':
      return [...concepts].sort((a, b) => a.name.localeCompare(b.name, 'fi'))
    case 'ALPHABETICAL_DESC':
      return [...concepts].sort((a, b) => b.name.localeCompare(a.name, 'fi'))
    case 'CREATION_ASC':
      return concepts
    case 'CREATION_DESC':
      return [...concepts].reverse()
    default:
      return concepts
    }
  }

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        classes={{ title: classes.header, content: classes.headerContent }}
        title={`Concepts of ${course.name}`}
        action={
          user.role === 'STAFF'
            ? (merging ? [
              cardHeaderButton('Merge…', () => openMergeDialog(), merging.size < 2),
              cardHeaderButton('Cancel', () => stopMerging())
            ] : [
              cardHeaderButton('Start merge', () => startMerging(), course.concepts.length < 2)
            ])
            : null
        }
      />

      <div className={classes.filterBar}>
        <TextField
          variant='outlined'
          margin='dense'
          label='Filter concepts'
          value={conceptFilter}
          onChange={evt => setConceptFilter(evt.target.value)}
          className={classes.filterText} />
        <TextField
          select
          variant='outlined'
          margin='dense'
          label='Sort by'
          value={sortMethod}
          onChange={evt => {
            setSortMethod(evt.target.value)
          }}
        >
          {Object.entries(sortingOptions).map(([key, label]) =>
            <MenuItem key={key} value={key}>{label}</MenuItem>
          )}
        </TextField>
      </div>

      {mergeDialogOpen !== null && <MergeDialog
        workspaceId={workspaceId} courseId={course.id} conceptIds={merging} close={closeMergeDialog}
        open={mergeDialogOpen.open}
      /> }
      <List ref={listRef} className={classes.list}>{
        sort(course.concepts).map(concept => {
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
              title={editing !== concept.id ?
                (concept.description || 'No description available') : ''}
            >
              <ListItem
                divider key={concept.id}
                classes={{ divider: classes.listItemContainer }}
                className={editing && editing !== concept.id ? classes.listItemDisabled : null}
              >
                {editing === concept.id ? (
                  <CreateConcept
                    submit={args => {
                      setEditing(null)
                      updateConcept({ id: concept.id, ...args })
                    }}
                    cancel={() => setEditing(null)}
                    defaultValues={concept}
                    action='Save'
                  />
                ) : <>
                <ListItemText className={classes.conceptBody}>
                  <Typography variant='h6' className={classes.conceptName}>
                    {concept.name}
                  </Typography>
                </ListItemText>
                <ListItemSecondaryAction>
                  {merging ? (
                    <Checkbox
                      checked={merging.has(concept.id)}
                      onClick={() => toggleMergingConcept(concept.id)}
                      color='primary'
                    />
                  ) : <>
                  {concept.frozen && user.role !== 'STAFF' && (
                    <IconButton disabled classes={{ root: classes.lockIcon }}>
                      <LockIcon />
                    </IconButton>
                  )}
                  {!concept.frozen &&
                    <IconButton
                      color={editing ? 'inherit' : undefined}
                      aria-label='Delete' onClick={() => {
                        const msg = `Are you sure you want to delete the concept ${concept.name}?`
                        if (window.confirm(msg)) {
                          deleteConcept(concept.id)
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  {(!concept.frozen || user.role === 'STAFF') &&
                    <IconButton
                      color={editing ? 'inherit' : undefined} aria-label='Edit'
                      onClick={() => setEditing(concept.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  }
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
  official: undefined,
  frozen: undefined
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
    <form className={classes.form} onSubmit={onSubmit} onKeyDown={onKeyDown}>
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
      <Select
        onChange={selected => setInput({ ...input, tags: selected || [] })}
        onCreateOption={newOption => setInput({
          ...input,
          tags: [...input.tags, onTagCreate(newOption)]
        })}
        styles={tagSelectStyles}
        options={Object.values(TaxonomyTags)}
        value={input.tags}
        isMulti
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
      { user.role === 'STAFF' && <>
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
        </>
      }
    </form>
  )
}

export default CourseEditor
