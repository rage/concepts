import { 
  IconButton, ListItem, ListItemIcon, 
  ListItemSecondaryAction, ListItemText, 
  Menu, MenuItem
} from '@material-ui/core'
import {
  MoreVert as MoreVertIcon,
  ArrowLeft as ArrowLeftIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@material-ui/icons'
import React, { useState } from 'react'

import { useConfirmDelete } from '../../dialogs/alert'
import { noPropagation } from '../../lib/eventMiddleware'
import ConceptToolTipContent from '../../components/ConceptTooltipContent'
import { useStyles } from './styles'

export const GoalItem = ({ goal, deleteConcept, setEditing, onClickCircle }) => {
  const classes = useStyles()
  const confirmDelete = useConfirmDelete()
  const [state, setState] = useState({ anchorEl: null })

  const handleMenuOpen = evt => setState({ anchorEl: evt.currentTarget })
  const handleMenuClose = () => setState({ anchorEl: null })

  const handleDelete = noPropagation(async () => {
    if (await confirmDelete(`Are you sure you want to delete the goal ${goal.name}?`)) {
      await deleteConcept(goal.id)
    }
    handleMenuClose()
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
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </ListItemIcon> 
      <ListItemSecondaryAction>
        <Menu
          anchorEl={state.anchorEl}
          open={state.anchorEl}
          onClose={handleMenuClose}
        >
          <MenuItem aria-label='Delete' onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon/>
            </ListItemIcon>
            Delete
          </MenuItem>
          <MenuItem aria-label='Edit' onClick={() => {
            setEditing(goal.id)
            handleMenuClose()
          }}>
            <ListItemIcon>
              <EditIcon/>
            </ListItemIcon>
            Edit
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  )
}
