import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Checkbox, IconButton, ListItem, ListItemSecondaryAction, ListItemText, Tooltip, Typography
} from '@material-ui/core'
import { Delete as DeleteIcon, Edit as EditIcon, Lock as LockIcon } from '@material-ui/icons'

import { DragHandle, SortableItem } from '../../lib/sortableMoc'
import ObjectiveEditor from './ObjectiveEditor'
import { Role } from '../../lib/permissions'
import ConceptToolTipContent from '../../components/ConceptTooltipContent'

const useStyles = makeStyles(theme => ({
  hoverButton: {
    visibility: 'hidden'
  },
  objectiveBody: {
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
      '& $objectiveBody': {
        paddingRight: '104px',
        '&$sortable': {
          paddingRight: '160px'
        }
      }
    }
  },
  sortable: {},
  objectiveName: {
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

const ObjectiveListItem = ({
  objective, user, index,
  editing, setEditing,
  updateObjective, deleteObjective,
  merging, toggleMergingObjective,
  divider = true,
  checkboxRef,
  objectiveTags,
  sortable = true
}) => {
  const classes = useStyles()
  const ItemClass = sortable ? SortableItem : ListItem

  const handleDelete = () => {
    const msg = `Are you sure you want to delete the objective ${objective.name}?`
    if (window.confirm(msg)) {
      deleteObjective(objective.id)
    }
  }
  const handleEdit = () => setEditing(objective.id)

  return (
    <Tooltip
      key={objective.id}
      placement='right-start'
      classes={{
        tooltip: classes.tooltip,
        popper: classes.popper
      }}
      TransitionComponent={({ children }) => children || null}
      title={editing !== objective.id ?
        <ConceptToolTipContent
          description={objective.description || 'No description available'}
          tags={objective.tags}
        />
        : ''}
    >
      <ItemClass
        divider={divider}
        key={objective.id}
        index={index}
        classes={{ divider: classes.listItemContainer }}
        className={editing && editing !== objective.id ? classes.listItemDisabled : null}
      >
        {editing === objective.id ? (
          <ObjectiveEditor
            submit={args => {
              setEditing(null)
              updateObjective({ id: objective.id, ...args })
            }}
            cancel={() => setEditing(null)}
            defaultValues={objective}
            action='Save'
            tagOptions={objectiveTags}
          />
        ) : <>
          <ListItemText className={`${classes.objectiveBody} ${sortable ? classes.sortable : ''}`}>
            <Typography variant='h6' className={classes.objectiveName}>
              {objective.name}
            </Typography>
          </ListItemText>

          <ListItemSecondaryAction>
            {merging ? (
              <Checkbox
                checked={merging.has(objective.id)}
                onClick={() => toggleMergingObjective(objective.id)}
                ref={checkboxRef}
                color='primary'
              />
            ) : <>
              {objective.frozen && user.role < Role.STAFF ? (
                <IconButton disabled classes={{ root: classes.hoverButton }}>
                  <LockIcon />
                </IconButton>
              ) : <>
                <IconButton
                  title={objective.frozen ? 'This objective is frozen' : undefined}
                  disabled={objective.frozen} className={classes.hoverButton} onClick={handleDelete}
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

export default ObjectiveListItem
