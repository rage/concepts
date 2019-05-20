import React from 'react'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { ALL_COURSES, CREATE_COURSE } from '../../services/CourseService'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottm: theme.spacing.unit * 2
  }
})

const MaterialCourseList = ({ classes }) => {
  const courses = useQuery(ALL_COURSES)

  return (

    <Grid item xs={12} md={6}>

      <Paper elevation={1} className={classes.root}>
        <Typography variant="h6" component="h3">
          Courses:
            </Typography>
        <List dense={false}>
          {
            courses.data.allCourses ?
              courses.data.allCourses.map(course => (
                <ListItem>


                  <ListItemText
                    primary={course.name}
                    secondary={true ? 'Concepts: ' + course.concepts.length : null}
                  />

                  <ListItemSecondaryAction>
                    <IconButton aria-label="Delete">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton aria-label="Delete">
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

              )) :
              null
          }


        </List>
      </Paper>
    </Grid>

  )
}

export default withStyles(styles)(MaterialCourseList)