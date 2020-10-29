import { 
  IconButton, ListItem, ListItemIcon, 
  ListItemText, ListItemSecondaryAction, Tooltip,
  Menu, MenuItem
} from '@material-ui/core'
import {
  MoreVert as MoreVertIcon,
  ArrowRight as ArrowRightIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@material-ui/icons'
import React, { useState } from 'react'

import { noPropagation } from '../../lib/eventMiddleware'
import { useConfirmDelete } from '../../dialogs/alert'
import { useStyles } from './styles'
import ConceptToolTipContent from '../../components/ConceptTooltipContent'

export const CourseItem = ({ course, onToggleCourse, deleteCourse, setEditing, onClickCircle, editing }) => {
  const classes = useStyles()
  const confirmDelete = useConfirmDelete()
  const [state, setState] = useState({ anchorEl: null })

  const handleMenuOpen = evt => setState({ anchorEl: evt.currentTarget })
  const handleMenuClose = () => setState({ anchorEl: null })

  const handleDelete = noPropagation(async () => {
    if (await confirmDelete(`Are you sure you want to delete the course ${course.name}?`)) {
      await deleteCourse(course.id)
      handleMenuClose()
    }
  })

  return (
    <Tooltip
      key={course.id}
      placement='left-start'
      classes={{
        tooltip: classes.tooltip,
        popper: classes.popper
      }}
      TransitionComponent={({ children }) => children || null}
      title={editing !== course.id ?
        <ConceptToolTipContent
          description={course.description || 'No description available'}
          tags={course.tags}
        />
        : ''}
    >
      <ListItem divider key={course.id} className={classes.listItemContainer}>
        <ListItemText className={classes.toggleable} onClick={onToggleCourse(course)}>{course.name}</ListItemText>
        <ListItemIcon>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <IconButton
            onClick={onClickCircle('course', course.id)}
            className={classes.activeCircle}
          >
            <ArrowRightIcon
              viewBox='7 7 10 10' id={`course-circle-${course.id}`}
              className='course-circle' />
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
              setEditing(course.id)
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
    </Tooltip>
  )
}
