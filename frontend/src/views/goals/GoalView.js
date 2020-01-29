import React, { useState } from 'react'
import {
  Card, CardHeader, ListItemText, List, ListItem, ListItemIcon, IconButton, ListItemSecondaryAction
} from '@material-ui/core'
import { ArrowRight as ArrowRightIcon, ArrowLeft as ArrowLeftIcon, Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { useMutation, useQuery } from 'react-apollo-hooks'

import { WORKSPACE_BY_ID } from '../../graphql/Query'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'
import CourseEditor from '../manager/CourseEditor'
import ConceptEditor from '../manager/ConceptEditor'
import ConceptToolTipContent from '../../components/ConceptTooltipContent'
import {
  CREATE_CONCEPT, DELETE_COURSE, CREATE_COURSE, UPDATE_CONCEPT, UPDATE_COURSE, DELETE_CONCEPT
} from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useConfirmDelete } from '../../dialogs/alert'
import { noPropagation } from '../../lib/eventMiddleware'

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
    zIndex: 2
  },
  circle: {
    zIndex: 2
  },
  listItemContainer: {
    padding: '0 16px',
    '&:hover': {
      '& $hoverButton': {
        visibility: 'visible'
      },
      '& $conceptBody': {
        paddingRight: '104px'
      }
    }
  },
  hoverButton: {
    visibility: 'hidden'
  }

}))

const CourseItem = ({ course, deleteCourse, setEditing }) => {
  const classes = useStyles()
  const confirmDelete = useConfirmDelete()

  const onToggle = () => {
    // TODO: implement
  }

  const handleDelete = noPropagation(async () => {
    if (await confirmDelete(`Are you sure you want to delete the course ${course.name}?`)) {
      await deleteCourse(course.id)
    }
  })

  return (
    <ListItem divider key={course.id} className={classes.listItemContainer}>
      <ListItemText>{course.name}</ListItemText>
      <ListItemIcon>
        <IconButton onClick={handleDelete} className={classes.hoverButton}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={() => setEditing(course.id)} className={classes.hoverButton}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={onToggle} className={classes.activeCircle}>
          <ArrowRightIcon
            viewBox='7 7 10 10' id={`course-circle-${course.id}`}
            className='course-circle' />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  )
}

const GoalItem = ({ goal, deleteConcept, setEditing }) => {
  const classes = useStyles()
  const confirmDelete = useConfirmDelete()

  const onToggle = () => {
    // TODO: implement
  }

  const handleDelete = noPropagation(async () => {
    if (await confirmDelete(`Are you sure you want to delete the goal ${goal.name}?`)) {
      await deleteConcept(goal.id)
    }
  })

  return (
    <ListItem divider key={goal.id} className={classes.listItemContainer}>
      <ListItemIcon>
        <IconButton onClick={onToggle} className={classes.activeCircle}>
          <ArrowLeftIcon
            viewBox='7 7 10 10' id={`goal-circle-${goal.id}`}
            className='goal-circle' />
        </IconButton>
      </ListItemIcon>
      <ListItemText>
        <ConceptToolTipContent tags={goal.tags} description={goal.name} />
      </ListItemText>
      <ListItemIcon>
        <IconButton onClick={handleDelete} className={classes.hoverButton}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={() => setEditing(goal.id)} className={classes.hoverButton}>
          <EditIcon />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  )
}

const Goals = ({ workspaceId, goals }) => {
  const classes = useStyles()
  const [editing, setEditing] = useState()

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })
  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate(workspaceId)
  })
  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate(workspaceId)
  })

  return (
    <Card elevation={0} className={classes.card}>
      <CardHeader title='Goals' />
      <List className={classes.list}>
        {goals.map(goal => editing === goal.id ? (
          <ConceptEditor
            submit={args => {
              setEditing(null)
              return updateConcept({ variables: args })
            }}
            cancel={() => setEditing(null)}
            defaultValues={goal}
            action='Save'
          />
        ) : (
          <GoalItem
            updateConcept={variables => updateConcept({ variables })}
            deleteConcept={id => deleteConcept({ variables: { id } })}
            key={goal.id} goal={goal} setEditing={setEditing}
          />
        ))}
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

const Courses = ({ workspaceId, courses }) => {
  const classes = useStyles()
  const [editing, setEditing] = useState()

  const createCourse = useMutation(CREATE_COURSE, { update: cache.createCourseUpdate(workspaceId) })
  const updateCourse = useMutation(UPDATE_COURSE, { update: cache.updateCourseUpdate(workspaceId) })
  const deleteCourse = useMutation(DELETE_COURSE, { update: cache.deleteCourseUpdate(workspaceId) })

  return (
    <Card elevation={0} className={classes.card}>
      <CardHeader title='Courses' />
      <List className={classes.list}>
        {courses.map(course => editing === course.id ? (
          <CourseEditor
            submit={args => {
              setEditing(null)
              return updateCourse({ variables: args })
            }}
            cancel={() => setEditing(null)}
            defaultValues={course}
            action='Save'
          />
        ) : (
          <CourseItem
            deleteCourse={id => deleteCourse({ variables: { id } })}
            key={course.id} course={course} setEditing={setEditing} />
        ))}
      </List>
      <CourseEditor submit={args => createCourse({
        variables: {
          workspaceId,
          ...args
        }
      })} />
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
      <Courses courses={courses} workspaceId={workspaceId} />
      <Goals goals={goals} workspaceId={workspaceId} />
    </div>
  )
}

export default GoalView
