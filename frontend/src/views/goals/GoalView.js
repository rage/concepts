import React from 'react'
import {
  Card, CardHeader, ListItemText, List, ListItem, ListItemIcon, IconButton
} from '@material-ui/core'
import { ArrowRight as ArrowRightIcon, ArrowLeft as ArrowLeftIcon } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { useMutation, useQuery } from 'react-apollo-hooks'

import { WORKSPACE_BY_ID } from '../../graphql/Query'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'
import CourseEditor from '../manager/CourseEditor'
import ConceptEditor from '../manager/ConceptEditor'
import { CREATE_CONCEPT } from '../../graphql/Mutation'
import cache from '../../apollo/update'

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
    flexDirection: 'column',
    overflow: 'hidden'
  },
  list: {
    overflow: 'auto'
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
      <ListItemText>{course.name}</ListItemText>
      <ListItemIcon>
        <IconButton onClick={onToggle} className={classes.activeCircle}>
          <ArrowRightIcon
            viewBox='7 7 10 10' id={`course-circle-${course.id}`}
            className='course-circle' />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  )
}

const GoalItem = ({ goal }) => {
  const classes = useStyles()

  const onToggle = () => {
    // TODO: implement
  }

  return (
    <ListItem divider key={goal.id}>
      <ListItemIcon>
        <IconButton onClick={onToggle} className={classes.activeCircle}>
          <ArrowLeftIcon
            viewBox='7 7 10 10' id={`goal-circle-${goal.id}`}
            className='goal-circle' />
        </IconButton>
      </ListItemIcon>
      <ListItemText>{ goal.name }</ListItemText>
    </ListItem>
  )
}

const Goals = ({ workspaceId, goals }) => {
  const classes = useStyles()

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })

  return (
    <Card elevation={0} className={classes.card}>
      <CardHeader title='Goals' />
      <List className={classes.list}>
        {goals.map(goal => <GoalItem key={goal.id} goal={goal} />)}
      </List>
      <ConceptEditor submit={args => createConcept({
        variables: {
          workspaceId,
          ...args
        }
      })} action='Create' defaultValues={{ level: 'GOAL' }} />
    </Card>
  )
}

const Courses = ({ courses }) => {
  const classes = useStyles()

  return (
    <Card elevation={0} className={classes.card}>
      <CardHeader title='Courses' />
      <List className={classes.list}>
        {courses.map(course => <CourseItem key={course.id} course={course} />)}
      </List>
      <CourseEditor />
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

  const courses = workspaceQuery.data.workspaceById.courses
  const goals = workspaceQuery.data.workspaceById.goals

  return (
    <div className={classes.root}>
      <h1 className={classes.title}>Goal Mapping</h1>
      <Courses courses={courses} />
      <Goals goals={goals} workspaceId={workspaceId} />
    </div>
  )
}

export default GoalView
