import React from 'react'
import { Card, CardHeader, CardContent, makeStyles, ListItemText, List, ListItem, ListItemIcon, IconButton, Tooltip } from '@material-ui/core'
import { ArrowRight as ArrowRightIcon, ArrowLeft as ArrowLeftIcon } from '@material-ui/icons'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import { useQuery } from 'react-apollo-hooks'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    overflow: 'hidden',
    gridGap: '16px',
    gridTemplate: `"header  header"   56px
                   "courses goals" 1fr
                  / 1fr     1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    }
  },
  card: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  cardContainer: {
    overflow: 'scroll'
  },
  title: {
    gridArea: 'header'
  },
  activeCircle: {
    zIndex: 2,
    padding: '4px'
  },
  circle: {
    zIndex: 2
  }
}))


const CourseItem = ({ course }) => {
  const classes = useStyles()

  const onToggle = () => {
    // TODO: implement
  }

  return (
    <ListItem divider key={course.id}>
      <ListItemText>{ course.name }</ListItemText>
      <ListItemIcon>
        <IconButton
          onClick={onToggle}
          className={classes.activeCircle}
        >
          <ArrowRightIcon
            viewBox='7 7 10 10' id={`course-circle-active-${course.id}`}
            className='course-circle-active' />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  )
}

const GoalItem = ({ name, id }) => {
  const classes = useStyles()

  const onToggle = () => {
    // TODO: implement
  }

  return (
    <ListItem divider key={id}>
      <ListItemIcon>
        <IconButton
          onClick={onToggle}
          className={classes.activeCircle}
          >
          <ArrowLeftIcon
            viewBox='7 7 10 10' id={`goal-circle-active-${id}`}
            className='goal-circle-active' />
        </IconButton>
      </ListItemIcon>
      <ListItemText>{ name }</ListItemText>
    </ListItem>
  )
}


const Goals = ({ goals }) => {
  const classes = useStyles()

  return (
    <Card elevation={0} className={classes.card}>
    <CardHeader title='Goals'/>
    <CardContent className={classes.cardContainer}>
      <List>
        {/* MOCK Goals */}
        <GoalItem name="Example Goal" id="12345"/>
        <GoalItem name="Goal 2" id="42345"/>
        <GoalItem name="Goal 6" id="22345"/>
      </List>
    </CardContent>
  </Card>
  )
}

const Courses = ({ courses }) => {
  const classes = useStyles() 

  return (
    <Card elevation={0} className={classes.card}>
      <CardHeader title='Courses'/>
      <CardContent className={classes.cardContainer}>
        <List>
          { courses.map(course => <CourseItem course={course}/>) }
        </List>
      </CardContent>
    </Card>
  )
}

const GoalView = ({ workspaceId }) => {
  const classes = useStyles()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  if (workspaceQuery.loading) {
    return <LoadingBar id='workspace-management' />
  } else if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  }

  return (
    <div className={classes.root}>
      <h1 className={classes.title}> Goal Mapping </h1>
      <Courses courses={workspaceQuery.data.workspaceById.courses}/>
      <Goals />
    </div>
  )
}

export default GoalView