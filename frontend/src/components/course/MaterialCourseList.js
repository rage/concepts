import React, { useState } from 'react'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import { withStyles } from '@material-ui/core/styles'
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useQuery, useMutation } from 'react-apollo-hooks'
import { ALL_COURSES, CREATE_COURSE } from '../../services/CourseService'


const styles = theme => ({
  root: {
    ...theme.mixins.gutters()
  }
})

const MaterialCourseList = ({ classes }) => {
  const [state, setState] = useState({ open: false })
  const [stateEdit, setStateEdit] = useState({ open: false })
  const [name, setName] = useState('')

  const courses = useQuery(ALL_COURSES)

  const createCourse = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const handleClickOpen = () => {
    setState({ open: true })
  }

  const handleClose = () => {
    setName('')
    setState({ open: false })
  }

  const handleEditOpen = () => {
    setStateEdit({ open: true })
  }

  const handleEditClose = () => {
    setName('')
    setStateEdit({ open: false })
  }

  const handleCreate = async (e) => {
    if (name === '') {
      window.alert('Course needs a name!')
      return
    }

    await createCourse({
      variables: { name }
    })
    handleClose()
  }

  const handleEdit = async (e) => {
    if (name === '') {
      window.alert('Course needs a name!')
      return
    }
    console.log(name)
    handleEditClose()
  }

  const handleDelete = async (e) => {
    let willDelete = window.confirm('Are you sure you want to delete this course?')
  }

  return (
    <React.Fragment>
      <Grid item xs={12} md={12}>
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
                  <ListItem key={course.id}>
                    <ListItemText
                      primary={course.name}
                      secondary={true ? 'Concepts: ' + course.concepts.length : null}
                    />
                    <ListItemSecondaryAction>
                      <IconButton aria-label="Delete" onClick={handleDelete}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton aria-label="Edit" onClick={handleEditOpen}>
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
      <Dialog
        open={state.open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Courses can be connected to other courses as prerequisites.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreate} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>



      <Dialog
        open={stateEdit.open}
        onClose={handleEditClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Courses can be connected to other courses as prerequisites.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

export default withStyles(styles)(MaterialCourseList)