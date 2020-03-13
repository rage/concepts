import React, { useEffect } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import Auth from './lib/authentication'
import { useLoginStateValue } from './lib/store'
import NavBar from './components/NavBar'
import WorkspaceNavBar from './components/WorkspaceNavBar'
import PrivateRoute from './components/PrivateRoute'
import CourseMapperView from './views/coursemapper/CourseMapperView'
import HomeView from './views/home/HomeView'
import MapperRedirectView from './views/coursemapper/redirect/MapperRedirectView'
import WorkspaceManagementView from './views/manager/WorkspaceManagementView'
import JoinView from './views/join/JoinView'
import HeatmapView from './views/heatmap/HeatmapView'
import LoginView from './views/login/LoginView'
import CytoGraphView from './views/graph/GraphView'
import ProjectView from './views/project/ProjectView'
import ProjectNavBar from './components/ProjectNavBar'
import CloneView from './views/project/CloneView'
import NotFoundView from './views/error/NotFoundView'
import PointGroupsView from './views/project/PointGroupsView'
import MembersView from './views/members/MembersView'
import UserView from './views/user/UserView'
import ConceptMapperView from './views/conceptmapper/ConceptMapperView'
import GoalView from './views/goals/GoalView'
import StatisticsView from './views/statistics/StatisticsView'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    height: '100vh',
    width: '100vw',
    gridGap: '10px',
    gridTemplate: `"navbar"  48px
                   "content" auto
                   "bottom-navbar" 56px
                   / 100vw`,
    pointerEvents: 'none',
    '& > *': {
      pointerEvents: 'initial'
    }
  }
}))

const workspaceRouter = (prefix) => <>
  <Route exact path={`${prefix}/:wid`} render={({ match }) =>
    <Redirect to={`${prefix}/${match.params.wid}/manager`} />} />
  <Route exact path={`${prefix}/:wid/heatmap`} render={({ match }) =>
    <HeatmapView urlPrefix={prefix} workspaceId={match.params.wid} />
  } />
  <Route
    exact path={`${prefix}/:wid/manager/:cid?`}
    render={({ match }) => <WorkspaceManagementView
      urlPrefix={`${prefix}/${match.params.wid}/manager`} workspaceId={match.params.wid}
      courseId={match.params.cid}
    />}
  />
  <Route
    exact path={`${prefix}/:wid/(concept)?mapper`}
    render={({ match }) => <MapperRedirectView workspaceId={match.params.wid} urlPrefix={prefix} />}
  />
  <Route
    exact path={`${prefix}/:wid/conceptmapper/:cid`}
    render={({ match }) =>
      <ConceptMapperView
        workspaceId={match.params.wid} courseId={match.params.cid} urlPrefix={prefix}
      />
    }
  />
  <Route
    exact path={`${prefix}/:wid/mapper/:cid`}
    render={({ match }) =>
      <CourseMapperView
        urlPrefix={prefix} courseId={match.params.cid} workspaceId={match.params.wid} />
    }
  />
  <Route exact path={`${prefix}/:wid/graph`} render={({ match: { params: { wid } } }) =>
    <CytoGraphView workspaceId={wid} />} />
  <Route exact path={`${prefix}/:wid/members`} render={({ match: { params: { wid } } }) =>
    <MembersView workspaceId={wid} />} />
  <Route exact path={`${prefix}/:wid/goals`} render={({ match: { params: { wid } } }) =>
    <GoalView workspaceId={wid} />} />
  <Route
    path={`${prefix}/:wid/:page(conceptmapper|mapper|graph|heatmap|manager|members|goals)/:cid?`}
    exact render={({ match: { params: { wid, cid, page } } }) =>
      <WorkspaceNavBar urlPrefix={prefix} workspaceId={wid} courseId={cid} page={page} />
    }
  />
</>

const projectRouter = prefix => <>
  <Route exact path={`${prefix}/:id`} render={({ match }) =>
    <Redirect to={`${prefix}/${match.params.id}/overview`} />} />
  <Route
    exact path={`${prefix}/:id/:page(overview|statistics|points|members)`}
    render={({ match: { params: { id, page } } }) =>
      <ProjectNavBar urlPrefix={prefix} projectId={id} page={page} />
    }
  />
  <Route
    exact path={`${prefix}/:id/overview`}
    render={({ match: { params: { id } } }) =>
      <ProjectView projectId={id} />
    }
  />
  <Route
    exact path={`${prefix}/:id/statistics`}
    render={({ match: { params: { id } } }) =>
      <StatisticsView projectId={id} />
    }
  />
  <Route exact path={`${prefix}/:id/members`} render={({ match: { params: { id } } }) =>
    <MembersView projectId={id} />} />
  <Route
    exact path={`${prefix}/:id/points`}
    render={({ match: { params: { id } } }) =>
      <PointGroupsView projectId={id} />
    }
  />
  <Route
    exact path={`${prefix}/:id/clone`}
    render={({ match: { params: { id } } }) =>
      <CloneView projectId={id} />
    }
  />
  <Route
    path={`${prefix}/:id/workspaces`}
    render={({ match: { url } }) => workspaceRouter(url)} />
  <Route
    path={`${prefix}/:id/templates`}
    render={({ match: { url } }) => workspaceRouter(url)} />
  <Route
    path={`${prefix}/:id/merges`}
    render={({ match: { url } }) => workspaceRouter(url)} />
</>

const App = () => {
  const [{ loggedIn }, dispatch] = useLoginStateValue()
  const classes = useStyles()

  useEffect(() => {
    Auth.updateLocalInfo().then(dispatch).catch(err => console.error('Auth update error:', err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div className={classes.root}>
    <Route render={({ location }) => <NavBar location={location} />} />

    <Switch>
      <Route exact path='/' render={() => <HomeView />} />

      <Route exact path='/login' render={() => <LoginView />} />
      <Route exact path='/login/error' render={() => <Redirect to='/login' />} />

      <PrivateRoute
        exact path='/user' redirectPath='/login' condition={loggedIn}
        render={() => <UserView />} />
      <PrivateRoute
        exact path='/join/:token' redirectPath='/login' condition={loggedIn}
        render={({ match: { params: { token } } }) => <JoinView token={token} />} />
      <PrivateRoute
        path='/workspaces' redirectPath='/login' condition={loggedIn}
        render={() => workspaceRouter('/workspaces')} />
      <PrivateRoute
        path='/projects' redirectPath='/login' condition={loggedIn}
        render={() => projectRouter('/projects')} />

      <Route render={() => <NotFoundView />} />
    </Switch>
  </div>
}

export default App
