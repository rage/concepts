import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { Typography, CircularProgress, Paper } from '@material-ui/core'

import { WORKSPACE_BY_ID } from '../../graphql/Query'
import NotFoundView from '../error/NotFoundView'
import { useMessageStateValue } from '../../store'
import CourseList from './CourseList'
import CourseEditor from './CourseEditor'
import {
  CREATE_CONCEPT, CREATE_COURSE, DELETE_CONCEPT, DELETE_COURSE, UPDATE_CONCEPT, UPDATE_COURSE
} from '../../graphql/Mutation'
import cache from '../../apollo/update'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    // For some reason, this makes the 1fr sizing work without needing to hardcode heights of other
    // objects in the parent-level grid.
    overflow: 'hidden',
    gridGap: '16px',
    gridTemplate: `"header  header"    56px
                   "courses newCourse" 1fr
                  / 1fr     1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    }
  },
  header: {
    gridArea: 'header',
    margin: '16px 0'
  },
  toolbar: {
    gridArea: 'toolbar'
  },
  courses: {
    gridArea: 'courses',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      overflow: 'auto'
    }
  },
  newCourse: {
    gridArea: 'newCourse',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      overflow: 'auto'
    }
  },
  courseEditor: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    overflow: 'visible'
  }
}))

const WorkspaceManagementView = ({ workspaceId }) => {
  const classes = useStyles()

  const [, messageDispatch] = useMessageStateValue()

  const [focusedCourseId, setFocusedCourseId] = useState(null)

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const createCourse = useMutation(CREATE_COURSE, { update: cache.createCourseUpdate(workspaceId) })
  const updateCourse = useMutation(UPDATE_COURSE, { update: cache.updateCourseUpdate(workspaceId) })
  const deleteCourse = useMutation(DELETE_COURSE, { update: cache.deleteCourseUpdate(workspaceId) })
  const createConcept = useMutation(CREATE_CONCEPT, { update: cache.createConceptUpdate })
  const updateConcept = useMutation(UPDATE_CONCEPT, { update: cache.updateConceptUpdate })
  const deleteConcept = useMutation(DELETE_CONCEPT, { update: cache.deleteConceptUpdate })

  if (workspaceQuery.loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
    )
  } else if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  }

  const e = err => messageDispatch({
    type: 'setError',
    data: err.message
  })

  const workspace = workspaceQuery.data.workspaceById
  const focusedCourse = focusedCourseId && workspace.courses.find(c => c.id === focusedCourseId)
  if (focusedCourseId && !focusedCourse) {
    setFocusedCourseId(null)
  }

  return (
    <div className={classes.root}>
      <Typography className={classes.header} variant='h4'>
        Workspace: {workspace.name}
      </Typography>
      <div className={classes.courses}>
        <CourseList
          courses={workspace.courses}
          setFocusedCourseId={setFocusedCourseId}
          focusedCourseId={focusedCourseId}
          deleteCourse={id => deleteCourse({ variables: { id } }).catch(e)}
          updateCourse={(id, name) => updateCourse({ variables: { id, name } }).catch(e)}
          createCourse={name => createCourse({ variables: { name, workspaceId } }).catch(e)}
        />
      </div>
      <div className={classes.newCourse}>
        {focusedCourse
          ? <CourseEditor
            course={focusedCourse}
            createConcept={args => createConcept({ variables: {
              workspaceId,
              courseId: focusedCourse.id,
              ...args
            } }).catch(e)}
            deleteConcept={id => deleteConcept({ variables: { id } }).catch(e)}
            updateConcept={args => updateConcept({ variables: args }).catch(e)}
          /> : <Paper elevation={0} />
        }
      </div>
    </div>
  )
}

export default WorkspaceManagementView
