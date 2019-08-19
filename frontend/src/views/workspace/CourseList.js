import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Card, CardHeader, List, ListItem, ListItemText,
  IconButton, ListItemSecondaryAction
} from '@material-ui/core'
import { Delete as DeleteIcon } from '@material-ui/icons'

import { useMessageStateValue } from '../../store'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    overflow: 'visible'
  },
  listItemActive: {
    boxShadow: `inset 3px 0px ${theme.palette.primary.dark}`
  }
}))

const CourseList = ({ courses, handleChangeCourse, courseInEdit, deleteCourse }) => {
  const classes = useStyles()

  const messageDispatch = useMessageStateValue()[1]

  const handleDeleteCourse = async (id) => {
    const willDelete = window.confirm('Are you sure you want to delete this course?')
    if (willDelete) {
      try {
        await deleteCourse({
          variables: { id }
        })
      } catch (err) {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
  }

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        title='Courses'
      />
      <List className={classes.list}>
        {
          courses.map(course => (
            <ListItem
              className={courseInEdit && course.id === courseInEdit.id
                ? classes.listItemActive
                : null}
              button
              key={course.id}
              onClick={() => handleChangeCourse(course)}
            >
              <ListItemText
                primary={
                  <Typography variant='h6'>
                    {course.name}
                  </Typography>
                }
              />
              {
                <ListItemSecondaryAction>
                  <IconButton aria-label='Delete' onClick={() => handleDeleteCourse(course.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              }
            </ListItem>
          ))
        }
      </List>
    </Card>
  )
}

export default CourseList
