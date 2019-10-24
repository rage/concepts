import {
  Checkbox, Fade, IconButton, ListItem, ListItemSecondaryAction, ListItemText, Tooltip, Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Delete as DeleteIcon, Edit as EditIcon, Lock as LockIcon } from '@material-ui/icons'
import React from 'react'

import { DragHandle, SortableItem } from '../../lib/sortableMoc'
import ConceptEditor from './ConceptEditor'
import { Role } from '../../lib/permissions'

const useStyles = makeStyles(theme => ({
  listItemContainer: {
    '&:hover $lockIcon': {
      visibility: 'visible'
    }
  },
  lockIcon: {
    visibility: 'hidden'
  },
  conceptBody: {
    paddingRight: '128px'
  },
  conceptName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  listItemDisabled: {
    color: 'rgba(0, 0, 0, 0.26)'
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

const ConceptListItem = ({
  concept, user, index,
  editing, setEditing,
  updateConcept, deleteConcept,
  merging, toggleMergingConcept,
  divider = true,
  checkboxRef,
  conceptTags,
  sortable = true
}) => {
  const classes = useStyles()
  const ItemClass = sortable ? SortableItem : ListItem
  return (
    <Tooltip
      key={concept.id}
      placement='top'
      classes={{
        tooltip: classes.tooltip,
        popper: classes.popper
      }}
      TransitionComponent={Fade}
      title={editing !== concept.id ?
        concept.description || 'No description available' : ''}
    >
      <ItemClass
        divider={divider}
        key={concept.id}
        index={index}
        classes={{ divider: classes.listItemContainer }}
        className={editing && editing !== concept.id ? classes.listItemDisabled : null}
      >
        {editing === concept.id ? (
          <ConceptEditor
            submit={args => {
              setEditing(null)
              updateConcept({ id: concept.id, ...args })
            }}
            cancel={() => setEditing(null)}
            defaultValues={concept}
            action='Save'
            tagOptions={conceptTags}
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
                ref={checkboxRef}
                color='primary'
              />
            ) : <>
              {concept.frozen && user.role < Role.STAFF && (
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
              {(!concept.frozen || user.role >= Role.STAFF) &&
              <IconButton
                color={editing ? 'inherit' : undefined} aria-label='Edit'
                onClick={() => setEditing(concept.id)}
              >
                <EditIcon />
              </IconButton>
              }
              {sortable && <DragHandle />}
            </>}
          </ListItemSecondaryAction>
        </>}
      </ItemClass>
    </Tooltip>
  )
}

export default ConceptListItem
