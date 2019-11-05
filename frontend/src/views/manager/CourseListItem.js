import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { IconButton, ListItemSecondaryAction, ListItemText, Typography } from '@material-ui/core'
import { Delete as DeleteIcon, Edit as EditIcon, Lock as LockIcon } from '@material-ui/icons'

import { Role } from '../../lib/permissions'
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
  hoverButton: {
    visibility: 'hidden'
  },
  courseButton: {
    paddingRight: '56px',
    '&:hover': {
      paddingRight: '160px',
      '& $hoverButton': {
        visibility: 'visible'
      }
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

  const handleDelete = () => {
    const msg = `Are you sure you want to delete the course ${course.name}?`
    if (window.confirm(msg)) {
      deleteCourse(course.id)
    }
  }
  const handleEdit = () => setEditing(course.id)

  return (
    <SortableItem
      className={course.id === focusedCourseId ? classes.listItemActive :
        editing && editing !== course.id ? classes.listItemDisabled : null}
      button={editing !== course.id}
      classes={{ button: classes.courseButton }}
      index={index}
      ref={index === 0 ? infoBox.ref('manager', 'FOCUS_COURSE') : undefined}
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
            <IconButton disabled classes={{ root: classes.hoverButton }}>
              <LockIcon />
            </IconButton>
          ) : <>
            <IconButton
              title={course.frozen ? 'This course is frozen' : undefined}
              disabled={course.frozen} className={classes.hoverButton} onClick={handleDelete}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton className={classes.hoverButton} onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          </>}
          <DragHandle />
        </ListItemSecondaryAction>
      </>}
    </SortableItem>
  )
}

export default CourseListItem
