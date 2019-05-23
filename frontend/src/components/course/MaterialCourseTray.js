import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

// Card
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

// List
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip';

import CourseCreationDialog from './CourseCreationDialog'


const styles = theme => ({
  root: {
    width: '370px',
    marginRight: '8px',
  },
  cardHeader: {
    paddingBottom: '0px',
    textAlign: 'center'
  },
  list: {
    backgroundColor: theme.palette.background.paper,
    maxHeight: '80vh',
    width: '100%',
    overflow: 'auto'
    
  },
  listItem: {
    width: '100%',
    backgroundColor: '#fff',
    "&:focus": {
      backgroundColor: '#fff'
    }
  },
  button: {
    width: '100%'
  }
})

const MaterialPrerequisiteCourse = ({ classes, isPrerequisite, course, activeCourse, addCourseAsPrerequisite }) => {
  const onClick = async () => {
    await addCourseAsPrerequisite({
      variables: { id: activeCourse, prerequisite_id: course.id }
    })
  }
  return (
    <Tooltip title="Add course as prerequisite" placement="right">
      <ListItem button onClick={onClick} className={classes.listItem}>
        <ListItemText>{course.name}</ListItemText>
        <Checkbox checked={isPrerequisite} color="primary"></Checkbox>
      </ListItem>
    </Tooltip>
  )
}

const MaterialCourseTray = ({ classes, courses, activeCourse, addCourseAsPrerequisite, prerequisiteCourses, createCourse }) => {
  const [state, setState] = useState({ open: false})
  
  const handleClose = () => {
    setState({ open: false })
  }

  const handleClickOpen = () => {
    setState({ open: true })
  }

  return (
    <React.Fragment>
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
                    isPrerequisite={prerequisiteCourses.find(c => c.id === course.id) !== undefined}
                    classes={classes}
                  />
                )
              })
            }
          </List>
          <Button onClick={handleClickOpen} className={classes.button} variant="contained" color="secondary"> New course </Button>
        </CardContent>
      </Card>
      <CourseCreationDialog state={state} handleClose={handleClose} createCourse={createCourse} />
    </React.Fragment>
  )
}

export default withStyles(styles)(MaterialCourseTray);