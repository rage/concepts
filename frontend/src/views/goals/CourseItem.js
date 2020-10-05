import { IconButton, ListItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core'
import {
  ArrowRight as ArrowRightIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@material-ui/icons'
import React from 'react'

import { noPropagation } from '../../lib/eventMiddleware'
import { useConfirmDelete } from '../../dialogs/alert'
import { useStyles } from './styles'
import ConceptToolTipContent from '../../components/ConceptTooltipContent'

export const CourseItem = ({ course, deleteCourse, setEditing, onClickCircle, editing }) => {
  const classes = useStyles()
  const confirmDelete = useConfirmDelete()

  const handleDelete = noPropagation(async () => {
    if (await confirmDelete(`Are you sure you want to delete the course ${course.name}?`)) {
      await deleteCourse(course.id)
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
      <ListItemText>{course.name}</ListItemText>
      <ListItemIcon>
        <IconButton onClick={handleDelete} className={classes.hoverButton}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={() => setEditing(course.id)} className={classes.hoverButton}>
          <EditIcon />
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
    </ListItem>
    </Tooltip>
  )
}
