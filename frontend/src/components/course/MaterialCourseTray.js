import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid';

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

import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import IconButton from '@material-ui/core/IconButton'
import CourseCreationDialog from './CourseCreationDialog'

import { useQuery } from 'react-apollo-hooks'
import { ALL_COURSES } from '../../services/CourseService'

const styles = theme => ({
  root: {
    height: '90vh',
  },
  courseName: {
    wordBreak: 'break-word'
  },
  cardHeader: {
    // marginTop: '5px',
    paddingBottom: '0px',
    // textAlign: 'center',
  },
  title: {

  },
  list: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    overflow: 'auto',
    maxHeight: '73vh',
    padding: 0
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
  },
  extendedIcon: {
    marginRight: 5
  }
})

const MaterialPrerequisiteCourse = ({ classes, isPrerequisite, course, activeCourse, addCourseAsPrerequisite }) => {
  const onClick = async () => {
    await addCourseAsPrerequisite({
      variables: { id: activeCourse, prerequisite_id: course.id }
    })
  }
  return (
    <Tooltip title="Add course as prerequisite" enterDelay={500} leaveDelay={400} placement="right">
      <ListItem divider button onClick={onClick} className={classes.listItem}>
        <ListItemText className={classes.courseName}>{course.name}</ListItemText>
        <Checkbox checked={isPrerequisite} color="primary"></Checkbox>
      </ListItem>
    </Tooltip>
  )
}

const MaterialCourseTray = ({ classes, setCourseTrayOpen, courseTrayOpen, activeCourse, addCourseAsPrerequisite, prerequisiteCourses, createCourse }) => {
  const [state, setState] = useState({ open: false })

  const courses = useQuery(ALL_COURSES)

  const handleClose = () => {
    setState({ open: false })
  }

  const handleClickOpen = () => {
    setState({ open: true })
  }

  const handleTrayOpen = () => {
    setCourseTrayOpen(true)
  }

  const handleTrayClose = () => {
    setCourseTrayOpen(false)
  }

  return (
    <React.Fragment>
      {
        courseTrayOpen ?
          <Grid item xs={4} lg={3}>
            <Card elevation={0} className={classes.root}>
              <CardHeader
                className={classes.cardHeader}
                classes={{ title: classes.title }}
                title="Add course"
                titleTypographyProps={{ variant: 'h4' }}
                action={
                  <IconButton onClick={handleTrayClose} >
                    <ChevronLeftIcon />
                  </IconButton>
                }
              />
              <CardContent>
                {
                  courses.data.allCourses ?
                    <List disablePadding className={classes.list}>
                      {
                        courses.data.allCourses.filter(course => course.id !== activeCourse).map(course => {
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
                    :
                    null
                }
                <Button onClick={handleClickOpen} className={classes.button} variant="contained" color="secondary"> New course </Button>
              </CardContent>
            </Card>
            <CourseCreationDialog state={state} handleClose={handleClose} createCourse={createCourse} />
          </Grid>
          :
          <Fab style={{ position: 'absolute', top: '90%', zIndex: '1', left: '20px' }} onClick={handleTrayOpen} variant="extended" color="primary" >
            <AddIcon className={classes.extendedIcon} /> Add course
          </Fab>
      }
    </React.Fragment>
  )
}

export default withStyles(styles)(MaterialCourseTray);