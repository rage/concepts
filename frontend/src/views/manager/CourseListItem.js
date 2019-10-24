import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  IconButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Typography
} from '@material-ui/core'
import {
  Delete as DeleteIcon, Edit as EditIcon, Lock as LockIcon, MoreVert as MoreVertIcon
} from '@material-ui/icons'

import { Role } from '../../lib/permissions'
import { noPropagation } from '../../lib/eventMiddleware'
import { DragHandle, SortableItem } from '../../lib/sortableMoc'
import { useInfoBox } from '../../components/InfoBox'
import CourseEditor from './CourseEditor'

const useStyles = makeStyles(theme => ({
  listItemActive: {
    boxShadow: `inset 3px 0px ${theme.palette.primary.dark}`
  },
  listItemDisabled: {
    color: 'rgba(0, 0, 0, 0.26)'
  },
  lockIcon: {
    visibility: 'hidden'
  },
  courseButton: {
    paddingRight: '80px',
    '&:hover $lockIcon': {
      visibility: 'visible'
    }
  },
  courseName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}))

const CourseListItem = ({
  course, user, index,
  editing, setEditing,
  focusedCourseId, setFocusedCourseId,
  updateCourse, deleteCourse,
  courseTags
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()

  const [menuAnchor, setMenuAnchor] = useState(null)
  const handleDelete = () => {
    const msg = `Are you sure you want to delete the course ${course.name}?`
    if (window.confirm(msg)) {
      deleteCourse(course.id)
    }
    closeMenu()
  }
  const handleEdit = () => {
    setEditing(course.id)
    closeMenu()
  }
  const closeMenu = () => setMenuAnchor(null)
  const openMenu = evt => setMenuAnchor(evt.currentTarget)

  return (
    <SortableItem
      className={course.id === focusedCourseId ? classes.listItemActive :
        editing && editing !== course.id ? classes.listItemDisabled : null}
      button={editing !== course.id}
      classes={{ button: classes.courseButton }}
      index={index}
      ref={index === 0 ? infoBox.ref('manager', 'FOCUS_COURSE') : undefined}
      key={course.id}
      onClick={() => editing !== course.id && setFocusedCourseId(course.id)}
    >
      {editing === course.id ? <CourseEditor
        submit={args => {
          setEditing(null)
          updateCourse({ id: course.id, ...args })
        }}
        cancel={() => setEditing(null)}
        defaultValues={course}
        tagOptions={courseTags}
        action='Save'
      /> : <>
        <ListItemText primary={
          <Typography className={classes.courseName} variant='h6'>{course.name}</Typography>
        } />
        <ListItemSecondaryAction>
          {course.frozen && user.role < Role.STAFF ? (
            <IconButton disabled classes={{ root: classes.lockIcon }}>
              <LockIcon />
            </IconButton>
          ) : <>
            <IconButton onClick={noPropagation(openMenu)}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={noPropagation(closeMenu)}
            >
              <MenuItem onClick={noPropagation(handleDelete)}>
                <ListItemIcon><DeleteIcon /></ListItemIcon>
                Delete
              </MenuItem>
              <MenuItem onClick={noPropagation(handleEdit)}>
                <ListItemIcon><EditIcon /></ListItemIcon>
                Edit
              </MenuItem>
            </Menu>
          </>}
          <DragHandle />
        </ListItemSecondaryAction>
      </>}
    </SortableItem>
  )
}

export default CourseListItem
