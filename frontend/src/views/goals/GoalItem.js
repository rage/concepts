import { IconButton, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import {
  ArrowLeft as ArrowLeftIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@material-ui/icons'
import React from 'react'

import { useConfirmDelete } from '../../dialogs/alert'
import { noPropagation } from '../../lib/eventMiddleware'
import ConceptToolTipContent from '../../components/ConceptTooltipContent'
import { useStyles } from './GoalView'

export const GoalItem = ({ goal, deleteConcept, setEditing, onClickCircle }) => {
  const classes = useStyles()
  const confirmDelete = useConfirmDelete()

  const handleDelete = noPropagation(async () => {
    if (await confirmDelete(`Are you sure you want to delete the goal ${goal.name}?`)) {
      await deleteConcept(goal.id)
    }
  })

  return (
    <ListItem divider key={goal.id} className={classes.listItemContainer}>
      <ListItemIcon>
        <IconButton
          onClick={onClickCircle('goal', goal.id)} className={classes.activeCircle}
        >
          <ArrowLeftIcon
            viewBox='7 7 10 10' id={`goal-circle-${goal.id}`}
            className='goal-circle' />
        </IconButton>
      </ListItemIcon>
      <ListItemText>
        <ConceptToolTipContent
          tags={goal.tags} subtitle={goal.description} description={goal.name}
        />
      </ListItemText>
      <ListItemIcon>
        <IconButton onClick={handleDelete} className={classes.hoverButton}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={() => setEditing(goal.id)} className={classes.hoverButton}>
          <EditIcon />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  )
}
