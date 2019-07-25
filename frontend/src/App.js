import React from 'react'
import { Route } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles'
import { Snackbar, SnackbarContent, IconButton } from '@material-ui/core'
import { Error as ErrorIcon, Close as CloseIcon, Info as InfoIcon } from '@material-ui/icons'

import GuidedCourseView from './components/course/GuidedCourseView'
import PortView from './components/porting/PortView'
import NavBar from './components/common/NavBar'
import WorkspaceNavBar from './components/common/WorkspaceNavBar'
import PrivateRoute from './components/common/PrivateRoute'
import UserView from './components/user/UserView'
import LandingView from './components/common/LandingView'
import WorkspaceView from './components/workspace/WorkspaceView'
import JoinView from './components/common/JoinView'
import CourseHeatmap from './components/course/CourseHeatmap'

import { useMessageStateValue, useLoginStateValue } from './store'
import AuthenticationForm from './components/authentication/AuthenticationForm'
import GraphView from './components/graph/GraphView'

const styles = theme => ({
  root: {
    display: 'grid',
    height: '100vh',
    width: '100vw',
    gridGap: '10px',
    gridTemplate: `"navbar"  48px
                   "content" auto
                   "bottom-navbar" 56px
                   / 100vw`
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  notification: {
    backgroundColor: theme.palette.primary.dark
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
  const { loggedIn } = useLoginStateValue()[0]

  // Error handling
  const [{ error, notification }, dispatchMessage] = useMessageStateValue()

  const handleCloseErrorMessage = () => {
    dispatchMessage({
      type: 'clearError'
    })
  }

  const handleCloseNotificationMessage = () => {
    dispatchMessage({
      type: 'clearNotification'
    })
  }

  return (
    <>
      <div className={classes.root}>
        <NavBar />

        <Route exact path='/' render={() => <LandingView />} />

        <PrivateRoute
          exact path='/porting' redirectPath='/auth' condition={loggedIn}
          render={() => <PortView />} />
        <Route exact path='/auth' render={() => <AuthenticationForm />} />
        <Route exact path='/user' render={() => <UserView />} />

        <PrivateRoute
          exact path='/join/:token' redirectPath='/auth' condition={loggedIn}
          render={({ match: { params: { token } } }) => <JoinView token={token} />} />

        <Route exact path='/workspaces/:wid/heatmap' render={({ match }) => (
          <CourseHeatmap workspaceId={match.params.wid} />
        )} />

        <Route
          exact path='/workspaces/:wid/mapper'
          render={({ match, location }) =>
            <WorkspaceView workspaceId={match.params.wid} location={location} />}
        />
        <Route exact path='/workspaces/:wid/mapper/:cid' render={({ match }) => (
          <GuidedCourseView
            courseId={match.params.cid}
            workspaceId={match.params.wid}
          />
        )}
        />
        <Route exact path='/workspaces/:wid/graph' render={({ match: { params: { wid } } }) =>
          <GraphView workspaceId={wid} />} />
        <Route exact path='/workspaces/:id/courses' render={() =>
          <div>VIEW FOR ADDING AND MODIFYING COURSES</div>} />
        <Route
          exact path='/workspaces/:wid/:page(mapper|graph|heatmap)/:cid?'
          render={({ match: { params: { wid, cid, page } } }) =>
            <WorkspaceNavBar workspaceId={wid} courseId={cid} page={page} />}
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
            <span className={classes.message} id='error-message-id'>
              <ErrorIcon className={classes.errorIcon} />
              {error}
            </span>}
        />
      </Snackbar>

      <Snackbar open={notification !== ''}
        onClose={handleCloseNotificationMessage}
        ClickAwayListenerProps={{ onClickAway: () => null }}
        autoHideDuration={4000}
        className={classes.snackbar}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
      >
        <SnackbarContent className={classes.notification}
          action={[
            <IconButton
              key='close'
              aria-label='Close'
              color='inherit'
              onClick={handleCloseNotificationMessage}
            >
              <CloseIcon className={classes.icon} />
            </IconButton>
          ]}
          message={
            <span className={classes.message} id='notification-message-id'>
              <InfoIcon className={classes.errorIcon} />
              {notification}
            </span>}
        />
      </Snackbar>
    </>
  )
}



export default withStyles(styles)(App)
