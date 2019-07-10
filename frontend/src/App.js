import React from 'react'
import { Route } from 'react-router-dom'

import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import ErrorIcon from '@material-ui/icons/Error'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import GuidedCourseView from './components/course/GuidedCourseView'
import MatrixView from './components/course/MatrixView'
import PortView from './components/porting/PortView'
import CourseList from './components/course/CourseList'
import NavBar from './components/common/NavBar'
import PrivateRoute from './components/common/PrivateRoute'

import UserView from './components/user/UserView'

import LandingView from './components/common/LandingView'

import WorkspaceView from './components/workspace/WorkspaceView'

import CourseHeatmap from './components/course/CourseHeatmap'

import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { CREATE_COURSE, DELETE_COURSE, UPDATE_COURSE } from './graphql/Mutation/Course'
import { ALL_COURSES } from './graphql/Query/Course'

import { useErrorStateValue, useLoginStateValue } from './store'
import AuthenticationForm from './components/authentication/AuthenticationForm'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    display: 'grid',
    height: '100vh',
    width: '100vw',
    gridTemplate: `"navbar"  58px
                   "content" calc(100vh - 58px - 64px)
                   "bottom-navbar" 64px
                   / 100vw`
  },
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
    <>
      <div className={classes.root}>
        <NavBar />

        <Route exact path='/' render={() => <LandingView />} />

        <PrivateRoute
          exact path='/porting' redirectPath='/auth' condition={loggedIn}
          render={() => <PortView/> } />
        <Route exact path='/auth' render={() => <AuthenticationForm />} />
        <Route exact path='/user' render={() => <UserView />} />

        <Route exact path='/workspaces/:wid/heatmap' render={({ match }) => (
          <CourseHeatmap workspaceId={match.params.wid}/>
        )}/>

        <Route
          exact path='/workspaces/:id/(mapper|matrix|graph)'
          render={({ match, location }) =>
            <WorkspaceView workspaceId={match.params.id} location={location} />}
        />
        <Route exact path='/workspaces/:wid/mapper/:cid' render={({ match }) => (
          <GuidedCourseView
            courseId={match.params.cid}
            workspaceId={match.params.wid}
          />
        )}
        />
        <Route exact path='/workspaces/:wid/matrix/:cid' render={({ match }) => (
          <MatrixView
            courseId={match.params.cid}
            workspaceId={match.params.wid}
          />
        )} />
        <Route exact path='/workspaces/:wid/graph/:cid' render={() => <div>GRAPH</div>} />
        <Route exact path='/workspaces/:id/courses' render={() =>
          <div>VIEW FOR ADDING AND MODIFYING COURSES</div>} />
        <Route
          path='/workspaces/:wid/(mapper|matrix|graph|heatmap)'
          render={({ match, location }) =>
            <div style={{gridArea: 'bottom-navbar'}}>BOTTOM NAVIGATION BAR</div>}
        />
        <Route exact path='/courses' render={() => <CourseList
          updateCourse={updateCourse} createCourse={createCourse} deleteCourse={deleteCourse} />} />

        <Route exact path='/courses/:id' render={({ match }) => {
          return <GuidedCourseView
            course_id={match.params.id}
            createCourse={createCourse}
            updateCourse={updateCourse}
          />
        }}
        />
        <PrivateRoute
          exact path='/courses/:id/matrix' redirectPath='/auth' condition={loggedIn}
          render={({ match }) => {
            return <MatrixView course_id={match.params.id}/>
          }}
        />
      </div>
      <Snackbar open={error !== ''}
        onClose={handleCloseErrorMessage}
        ClickAwayListenerProps={{ onClickAway: () => null }}
        autoHideDuration={4000}
        className={classes.snackbar}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
      >
        <SnackbarContent className={classes.error}
          action={[
            <IconButton
              key='close'
              aria-label='Close'
              color='inherit'
              onClick={handleCloseErrorMessage}
            >
              <CloseIcon className={classes.icon} />
            </IconButton>
          ]}
          message={
            <span className={classes.message} id='message-id'>
              <ErrorIcon className={classes.errorIcon} />
              {error}
            </span>}
        />
      </Snackbar>
    </>
  )
}



export default withStyles(styles)(App)
