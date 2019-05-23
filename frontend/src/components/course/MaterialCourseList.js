import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'


import CourseCreationDialog from './CourseCreationDialog'
import CourseEditingDialog from './CourseEditingDialog'

const styles = theme => ({
  root: {
    ...theme.mixins.gutters()
  }
})

const MaterialCourseList = ({ classes, history, courses, updateCourse, deleteCourse, createCourse }) => {
  const [stateCreate, setStateCreate] = useState({ open: false })
  const [stateEdit, setStateEdit] = useState({ open: false, id: '' })
  


  const handleClickOpen = () => {
    setStateCreate({ open: true })
  }

  const handleClose = () => {
    setStateCreate({ open: false })
  }

  const handleEditOpen = (id) => () => {
    setStateEdit({ open: true, id })
  }

  const handleEditClose = () => {
    setStateEdit({ open: false, id: '' })
  }

  const handleDelete = (id) => async (e) => {
    let willDelete = window.confirm('Are you sure you want to delete this course?')
    if (willDelete) {
      await deleteCourse({
        variables: { id }
      })
    }
  }

  const handleNavigate = (id) => () => {
    history.push(`/courses/${id}`)
  }

  return (
    <Grid container justify="center">
      <Grid item md={8} xs={12}>
        <Card elevation={1} className={classes.root}>
          <CardHeader
            action={
              <IconButton aria-label="Add" onClick={handleClickOpen}>
                <AddIcon />
              </IconButton>
            }
            title={
              <Typography variant="h5" component="h3">
                Courses
              </Typography>
            }
          />
          <List dense={false}>
            {
              courses.data.allCourses ?
                courses.data.allCourses.map(course => (
                  <ListItem button key={course.id} onClick={handleNavigate(course.id)}>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          {course.name}
                        </Typography>
                      }
                      secondary={true ? 'Concepts: ' + course.concepts.length : null}
                    />
                    <ListItemSecondaryAction>
                      <IconButton aria-label="Delete" onClick={handleDelete(course.id)}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton aria-label="Edit" onClick={handleEditOpen(course.id)}>
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )) :
                null
            }
          </List>
        </Card>
      </Grid>

      <CourseCreationDialog state={stateCreate} handleClose={handleClose} createCourse={createCourse} />
      <CourseEditingDialog state={stateEdit} handleClose={handleEditClose} updateCourse={updateCourse} />
    </Grid>
  )
}

export default withRouter(withStyles(styles)(MaterialCourseList))