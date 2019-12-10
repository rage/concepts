import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { Typography, Tabs, Tab, AppBar } from '@material-ui/core'

import { useMessageStateValue } from '../../lib/store'
import useRouter from '../../lib/useRouter'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import {
  CREATE_CONCEPT, CREATE_COURSE, DELETE_CONCEPT, DELETE_COURSE, UPDATE_CONCEPT, UPDATE_COURSE,
  UPDATE_WORKSPACE
} from '../../graphql/Mutation'
import cache from '../../apollo/update'
import {
  useUpdatingSubscription,
  useManyUpdatingSubscriptions
} from '../../apollo/useUpdatingSubscription'
import { useInfoBox } from '../../components/InfoBox'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'
import CourseList from './CourseList'
import ItemList from './ItemList'

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
    gridTemplate: `"header  header"   56px
                   "courses concepts" 1fr
                  / 1fr     1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    }
  },
  header: {
    gridArea: 'header',
    margin: '16px 0 0',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
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
  concepts: {
    gridArea: 'concepts',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    '& > div': {
      height: '100%',
      overflow: 'auto'
    }
  },
  conceptNav: {
    borderRadius: '4px 4px 0 0'
  },
  courseEditor: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    overflow: 'visible'
  }
}))

const TabContent = ({ children, index, value }) =>
  <> {index === value && children} </>

const WorkspaceManagementView = ({ urlPrefix, workspaceId, courseId }) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const { history } = useRouter()
  const [index, setIndex] = useState(0)

  useUpdatingSubscription('workspace', 'update', {
    variables: { workspaceId }
  })

  useManyUpdatingSubscriptions(['course', 'concept'], ['create', 'delete', 'update'], {
    variables: { workspaceId }
  })

  useEffect(() => {
    infoBox.setView('manager')
    return () => infoBox.unsetView('manager')
  }, [infoBox])

  const [, messageDispatch] = useMessageStateValue()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    update: cache.updateWorkspaceUpdate(workspaceId)
  })
  const createCourse = useMutation(CREATE_COURSE, { update: cache.createCourseUpdate(workspaceId) })
  const updateCourse = useMutation(UPDATE_COURSE, { update: cache.updateCourseUpdate(workspaceId) })
  const deleteCourse = useMutation(DELETE_COURSE, { update: cache.deleteCourseUpdate(workspaceId) })
  const createConcept = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })
  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate(workspaceId)
  })
  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate(workspaceId)
  })

  if (workspaceQuery.loading) {
    return <LoadingBar id='workspace-management' />
  } else if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  }

  const e = err => messageDispatch({
    type: 'setError',
    data: err.message
  })

  const workspace = workspaceQuery.data.workspaceById
  const focusedCourse = courseId && workspace.courses.find(c => c.id === courseId)
  if (courseId && !focusedCourse) {
    history.replace(urlPrefix)
  }

  return (
    <main className={classes.root}>
      <Typography className={classes.header} variant='h4'>
        Workspace: {workspace.name}
      </Typography>
      <div className={classes.courses}>
        <CourseList
          workspace={workspace}
          setFocusedCourseId={courseId => history.push(`${urlPrefix}/${courseId}`)}
          focusedCourseId={courseId}
          updateWorkspace={args => updateWorkspace({ variables: args }).catch(e)}
          deleteCourse={id => deleteCourse({ variables: { id } }).catch(e)}
          updateCourse={args => updateCourse({ variables: args }).catch(e)}
          createCourse={args => createCourse({ variables: { workspaceId, ...args } }).catch(e)}
        />
      </div>
      {focusedCourse ? <div className={classes.concepts}>
        <AppBar position='static' className={classes.conceptNav} elevation={0}>
          <Tabs variant='fullWidth' value={index} onChange={(_, newValue) => setIndex(newValue)}>
            <Tab label='Objectives' />
            <Tab label='Concepts' />
          </Tabs>
        </AppBar>
        <ItemList
          level={index === 0 ? 'OBJECTIVE' : 'CONCEPT'}
          workspace={workspaceQuery.data.workspaceById}
          course={focusedCourse}
          updateCourse={args => updateCourse({ variables: args }).catch(e)}
          createConcept={args => createConcept({
            variables: {
              workspaceId,
              courseId: focusedCourse.id,
              ...args
            }
          }).catch(e)}
          deleteConcept={id => deleteConcept({ variables: { id } }).catch(e)}
          updateConcept={args => updateConcept({ variables: args }).catch(e)}
        />
      </div> : <div className={classes.concepts} /> }
    </main>
  )
}

export default WorkspaceManagementView
