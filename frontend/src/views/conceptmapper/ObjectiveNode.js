import React from 'react'
import { IconButton, ListItemText, ListItemSecondaryAction, Typography } from '@material-ui/core'
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'

import { SortableItem } from '../../lib/sortableMoc'

const useStyles = makeStyles(() => ({
  hoverButton: {
    visibility: 'hidden'
  },
  conceptBody: {
    paddingRight: '56px'
  },
  listItemContainer: {
    '&:hover': {
      '& $hoverButton': {
        visibility: 'visible'
      },
      '& $conceptBody': {
        paddingRight: '160px'
      }
    }
  }
}))

const ObjectiveNode = ({ concept, index }) => {
  const classes = useStyles()

  const handleDelete = () => {
    const msg = `Are you sure you want to delete the objetcive ${concept.name}?`
    if (window.confirm(msg)) {
      deleteConcept(concept.id)
    }
  }

  const handleEdit = () => alert('Not yet implemented')

  return (
    <SortableItem index={index} classes={{ divider: classes.listItemContainer }}>
      <ListItemText className={classes.conceptBody}>
        <Typography variant='h6' className={classes.conceptName}>
          {concept.name}
        </Typography>
      </ListItemText>
      <ListItemSecondaryAction>
        <IconButton
          title={concept.frozen ? 'This concept is frozen' : undefined}
          disabled={concept.frozen} className={classes.hoverButton} onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton>
        <IconButton className={classes.hoverButton} onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </SortableItem>
  )
}

export default ObjectiveNode
