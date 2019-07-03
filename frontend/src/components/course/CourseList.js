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
import GridOnIcon from '@material-ui/icons/GridOn'
import CircularProgress from '@material-ui/core/CircularProgress'

import { useQuery } from 'react-apollo-hooks'
import { ALL_COURSES } from '../../graphql/CourseService'

import CourseCreationDialog from './CourseCreationDialog'
import CourseEditingDialog from './CourseEditingDialog'

// Error dispatcher
import { useErrorStateValue, useLoginStateValue } from '../../store'

const styles = theme => ({
  root: {
    ...theme.mixins.gutters()
  },
  progress: {
    margin: theme.spacing(2)
  }
})

const CourseList = ({ classes, history, updateCourse, deleteCourse, createCourse }) => {
  const [stateCreate, setStateCreate] = useState({ open: false })
  const [stateEdit, setStateEdit] = useState({ open: false, id: '', name: '' })

  const courses = useQuery(ALL_COURSES)

  const { loggedIn } = useLoginStateValue()[0]
  const errorDispatch = useErrorStateValue()[1]

  const handleClickOpen = () => {
    if (!loggedIn) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateCreate({ open: true })
  }

  const handleClose = () => {
    setStateCreate({ open: false })
  }

  const handleEditOpen = (id, name) => () => {
    if (!loggedIn) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    setStateEdit({ open: true, id, name })
  }

  const handleEditClose = () => {
    setStateEdit({ open: false, id: '', name: '' })
  }

  const handleDelete = (id) => async (e) => {
    if (!loggedIn) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      return
    }
    
    let willDelete = window.confirm('Are you sure you want to delete this course?')
    if (willDelete) {
      try {
        await deleteCourse({
          variables: { id }
        })
      } catch (err) {
        errorDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
  }

  const handleNavigateColumns = (id) => () => {
    history.push(`/courses/${id}`)
  }
  const handleNavigateMatrix = (id) => () => {
    history.push(`/courses/${id}/matrix`)
  }

  return (
    <Grid container justify="center">
      <Grid item md={8} xs={12}>
        <Card elevation={0} className={classes.root}>
          <CardHeader
            action={
              loggedIn ? 
                <IconButton aria-label="Add" onClick={handleClickOpen}>
                  <AddIcon />
                </IconButton> : null
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
                  <ListItem button key={course.id} onClick={handleNavigateColumns(course.id)}>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          {course.name}
                        </Typography>
                      }
                      secondary={true ? 'Concepts: ' + course.concepts.length : null}
                    />
                    {
                      loggedIn ? 
                        <ListItemSecondaryAction>
                          <IconButton aria-label="Matrix" onClick={handleNavigateMatrix(course.id)}>
                            <GridOnIcon />
                          </IconButton>
                          <IconButton aria-label="Delete" onClick={handleDelete(course.id)}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton aria-label="Edit" onClick={handleEditOpen(course.id, course.name)}>
                            <EditIcon />
                          </IconButton>
                        </ListItemSecondaryAction> : null
                    }
                    
                  </ListItem>
                )) :
                <div style={{ textAlign: 'center' }}>
                  <CircularProgress className={classes.progress} />
                </div>
            }
          </List>
        </Card>
      </Grid>

      <CourseCreationDialog state={stateCreate} handleClose={handleClose} createCourse={createCourse} />
      <CourseEditingDialog state={stateEdit} handleClose={handleEditClose} updateCourse={updateCourse} defaultName={stateEdit.name} />
    </Grid>
  )
}

export default withRouter(withStyles(styles)(CourseList))