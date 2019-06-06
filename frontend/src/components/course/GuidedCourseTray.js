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
import TextField from '@material-ui/core/TextField'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import IconButton from '@material-ui/core/IconButton'
import CourseCreationDialog from './CourseCreationDialog'
import { useQuery, useMutation, useApolloClient } from 'react-apollo-hooks'
import { ALL_COURSES } from '../../services/CourseService'

import {
  ADD_COURSE_AS_PREREQUISITE,
  DELETE_COURSE_AS_PREREQUISITE,
  COURSE_PREREQUISITE_COURSES
} from '../../services/CourseService'

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
  }
})

const PrerequisiteCourse = ({ classes, isPrerequisite, course, activeCourse, addCourseAsPrerequisite, deleteCourseAsPrerequisite }) => {
  const onClick = async () => {
    if (isPrerequisite) {
      await deleteCourseAsPrerequisite({
        variables: { id: activeCourse, prerequisite_id: course.id }
      })
    } else {
      await addCourseAsPrerequisite({
        variables: { id: activeCourse, prerequisite_id: course.id }
      })
    }
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

const GuidedCourseTray = ({ classes, setCourseTrayOpen, courseTrayOpen, activeCourse, course_id, prerequisiteCourses, createCourse }) => {
  const [state, setState] = useState({ open: false })
  const [filterKeyword, setFilterKeyword] = useState('')

  const courses = useQuery(ALL_COURSES)


  const client = useApolloClient()

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)


  const addCourseAsPrerequisite = useMutation(ADD_COURSE_AS_PREREQUISITE, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES,variables: { id: course_id } })
      const addedCourse = response.data.addCourseAsCoursePrerequisite
      const dataInStoreCopy = { ...dataInStore }
      const prerequisiteCourses = dataInStoreCopy.courseById.prerequisiteCourses
      if (!includedIn(prerequisiteCourses, addedCourse)) {
        prerequisiteCourses.push(addedCourse)
        client.writeQuery({
          query: COURSE_PREREQUISITE_COURSES,
          variables: { id: course_id },
          data: dataInStoreCopy
        })
      }
    }

  })

  const deleteCourseAsPrerequisite = useMutation(DELETE_COURSE_AS_PREREQUISITE, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES,variables: { id: course_id } })
      const removedCourse = response.data.deleteCourseAsCoursePrerequisite
      const dataInStoreCopy = { ...dataInStore }
      const prerequisiteCourses = dataInStoreCopy.courseById.prerequisiteCourses
      if (includedIn(prerequisiteCourses, removedCourse)) {
        dataInStoreCopy.courseById.prerequisiteCourses = prerequisiteCourses.filter(course => course.id !== removedCourse.id)
        client.writeQuery({
          query: COURSE_PREREQUISITE_COURSES,
          variables: { id: course_id },
          data: dataInStoreCopy
        })
      }
    }
    
  })

  const handleKeywordInput = (e) => {
    setFilterKeyword(e.target.value)
  }

  const handleClose = () => {
    setState({ open: false })
  }

  const handleClickOpen = () => {
    setState({ open: true })
  }

  const handleTrayClose = () => {
    setCourseTrayOpen(false)
  }

  const isPrerequisite = (course) => {
    return (prerequisiteCourses.find(c => c.id === course.id) !== undefined)
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
                       
              <CardContent> <TextField
              margin="dense"
              id="description"
              label="Filter"
              type="text"
              name="filter"
              fullWidth
              value={filterKeyword}
              onChange={handleKeywordInput}
            />

                {
                  courses.data.allCourses ?
                    <List disablePadding className={classes.list}>
                      {
                        courses.data.allCourses.filter(course => course.name.toLowerCase().includes(filterKeyword.toLowerCase())).map(course => {
                          return (
                            <PrerequisiteCourse
                              key={course.id}
                              course={course}
                              activeCourse={activeCourse}
                              addCourseAsPrerequisite={addCourseAsPrerequisite}
                              deleteCourseAsPrerequisite={deleteCourseAsPrerequisite}
                              isPrerequisite={isPrerequisite(course)}
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
          null
      }
    </React.Fragment>
  )
}

export default withStyles(styles)(GuidedCourseTray);