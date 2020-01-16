import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Checkbox, IconButton, ListItem, ListItemSecondaryAction, ListItemText, Tooltip, Typography
} from '@material-ui/core'
import { Delete as DeleteIcon, Edit as EditIcon, Lock as LockIcon } from '@material-ui/icons'

import { DragHandle, SortableItem } from '../../lib/sortableMoc'
import ConceptEditor from './ConceptEditor'
import { Role } from '../../lib/permissions'
import ConceptToolTipContent from '../../components/ConceptTooltipContent'

const useStyles = makeStyles(theme => ({
  hoverButton: {
    visibility: 'hidden'
  },
  conceptBody: {
    paddingRight: 0,
    '&$sortable': {
      paddingRight: '56px'
    }
  },
  listItemContainer: {
    '&:hover': {
      '& $hoverButton': {
        visibility: 'visible'
      },
      '& $conceptBody': {
        paddingRight: '104px',
        '&$sortable': {
          paddingRight: '160px'
        }
      }
    }
  },
  sortable: {},
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
  sortable = true,
  commonConcepts
}) => {
  const classes = useStyles()
  const ItemClass = sortable ? SortableItem : ListItem

  const handleDelete = () => {
    const msg = `Are you sure you want to delete the concept ${concept.name}?`
    if (window.confirm(msg)) {
      deleteConcept(concept.id)
    }
  }
  const handleEdit = () => setEditing(concept.id)

  return (
    <Tooltip
      key={concept.id}
      placement='right-start'
      classes={{
        tooltip: classes.tooltip,
        popper: classes.popper
      }}
      TransitionComponent={({ children }) => children || null}
      title={editing !== concept.id ?
        <ConceptToolTipContent
          description={concept.description || 'No description available'}
          tags={concept.tags}
        />
        : ''}
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
            commonConcepts={commonConcepts}
          />
        ) : <>
          <ListItemText className={`${classes.conceptBody} ${sortable ? classes.sortable : ''}`}>
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
              {concept.frozen && user.role < Role.STAFF ? (
                <IconButton disabled classes={{ root: classes.hoverButton }}>
                  <LockIcon />
                </IconButton>
              ) : <>
                <IconButton
                  title={concept.frozen ? 'This concept is frozen' : undefined}
                  disabled={concept.frozen} className={classes.hoverButton} onClick={handleDelete}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton className={classes.hoverButton} onClick={handleEdit}>
                  <EditIcon />
                </IconButton>
              </>}
              {sortable && <DragHandle />}
            </>}
          </ListItemSecondaryAction>
        </>}
      </ItemClass>
    </Tooltip>
  )
}

export default ConceptListItem
