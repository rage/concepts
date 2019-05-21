import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

// Card
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

// List
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button'

const styles = theme => ({
  root: {
    width: '370px',
    marginRight: '8px',
  },
  cardHeader: {
    paddingBottom: '0px'
  },
  list: {
    backgroundColor: theme.palette.background.paper,
    maxHeight: 500,
    width: '100%',
    overflow: 'auto'
  },
  listItem: {
    width: '100%'
  },
  button: {
    width: '100%'
  }
})

const MaterialPrerequisiteCourse = ({ course, activeCourse, addCourseAsPrerequisite }) => {
  const onClick = async () => {
    await addCourseAsPrerequisite({
      variables: { id: activeCourse, prerequisite_id: course.id }
    })
  }
  return (
    <ListItem>
      <ListItemText>{course.name}</ListItemText>
      <Checkbox color="primary" onClick={onClick}></Checkbox>
    </ListItem>
  )
}

const MaterialCourseTray = ({ classes, courses, activeCourse, addCourseAsPrerequisite }) => {
  return (
    <Card elevation={3} className={classes.root}>
        <CardHeader className={classes.cardHeader} title="Add course" />
        <CardContent>
          <List disablePadding className={classes.list}>
          {
            courses.filter(course => course.id !== activeCourse).map(course => {
              return (
                <MaterialPrerequisiteCourse
                  key={course.id}
                  course={course}
                  activeCourse={activeCourse}
                  addCourseAsPrerequisite={addCourseAsPrerequisite}
                />
              )
            })
          }
          </List>
          <Button className={classes.button} variant="contained" color="secondary"> New course </Button>
        </CardContent>
      </Card>
  )
}

export default withStyles(styles)(MaterialCourseTray);