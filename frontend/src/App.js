import React from 'react'
import { Route } from 'react-router-dom'
import './App.css'

import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import ErrorIcon from '@material-ui/icons/Error'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import GuidedCourseView from './components/course/GuidedCourseView'
import MatrixView from './components/course/MatrixView'
import CourseList from './components/course/CourseList'
import NavBar from './components/common/NavBar'
import PrivateRoute from './components/common/PrivateRoute'

import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { ALL_COURSES, CREATE_COURSE, DELETE_COURSE, UPDATE_COURSE } from './services/CourseService'
import { Grid } from '@material-ui/core';

import { useErrorStateValue, useLoginStateValue } from './store'
import AuthenticationForm from './components/authentication/AuthenticationForm'
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  error: {
    backgroundColor: theme.palette.error.dark
  },
  icon: {
    fontSize: 20
  },
  errorIcon: {
    marginRight: theme.spacing(1)
  },
  snackbar: {
    margin: theme.spacing(4)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
})

const App = ({ classes }) => {
  const client = useApolloClient()
  // const courses = useQuery(ALL_COURSES)

  const { loggedIn } = useLoginStateValue()[0]

  // Error handling
  const { error } = useErrorStateValue()[0]
  const dispatchError = useErrorStateValue()[1]

  const handleCloseErrorMessage = () => {
    dispatchError({
      type: 'clearError'
    })
  }

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const createCourse = useMutation(CREATE_COURSE, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_COURSES })
      const addedCourse = response.data.createCourse

      if (!includedIn(dataInStore.allCourses, addedCourse)) {
        dataInStore.allCourses.push(addedCourse)
        client.writeQuery({
          query: ALL_COURSES,
          data: dataInStore
        })
      }
    }
  })

  const deleteCourse = useMutation(DELETE_COURSE, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_COURSES })
      const deletedCourse = response.data.deleteCourse

      if (includedIn(dataInStore.allCourses, deletedCourse)) {
        dataInStore.allCourses = dataInStore.allCourses.filter(course => {
          return course.id !== deletedCourse.id
        })
        client.writeQuery({
          query: ALL_COURSES,
          data: dataInStore
        })
      }
    }
  })

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_COURSES })
      const updatedCourse = response.data.updateCourse

      if (includedIn(dataInStore.allCourses, updatedCourse)) {
        dataInStore.allCourses = dataInStore.allCourses.map(course => {
          return course.id === updatedCourse.id ? updatedCourse : course
        })
        client.writeQuery({
          query: ALL_COURSES,
          data: dataInStore
        })
      }
    }
  })

  return (
    <React.Fragment>
    <div className="App">
      <Grid container>
        <Grid item xs={12}>
          <NavBar />
        </Grid>
        <Route exact path="/auth" render={() => <AuthenticationForm />} />
        <Route exact path="/" render={() => <CourseList updateCourse={updateCourse} createCourse={createCourse} deleteCourse={deleteCourse} />} />
        <Route exact path="/courses/:id" render={({ match }) => {
          return <GuidedCourseView
          course_id={match.params.id}
          createCourse={createCourse}
          updateCourse={updateCourse}
          />
        }}
        />
        <Grid item xs={12}>
          <PrivateRoute exact path="/courses/:id/matrix" redirectPath="/auth" condition={loggedIn} render={({ match }) => {
            return <MatrixView
            course_id={match.params.id}
            createCourse={createCourse}
            updateCourse={updateCourse}
            />
          }}
          />
        </Grid>
      </Grid>
    </div>
    <Snackbar open={error !== ''}
        onClose={handleCloseErrorMessage}
        ClickAwayListenerProps={{ onClickAway: () => null }}
        autoHideDuration={4000}
        className={classes.snackbar}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
      >
      <SnackbarContent className={classes.error}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={handleCloseErrorMessage}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
        message={
          <span className={classes.message} id="message-id">
            <ErrorIcon className={classes.errorIcon} />
            { error }
          </span>}
      />
    </Snackbar>
    </React.Fragment>
  )
}



export default withStyles(styles)(App)
