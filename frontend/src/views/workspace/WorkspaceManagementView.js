import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'
import {
  Typography, CircularProgress, Button, TextField, Paper, List, ListItem, ListItemText,
  IconButton, ListItemSecondaryAction
} from '@material-ui/core'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons'

import { WORKSPACE_FOR_EDIT } from '../../graphql/Query'
import NotFoundView from '../error/NotFoundView'
import { useMessageStateValue } from '../../store'
import CourseList from './CourseList'
import CourseEditor from './CourseEditor'
import { CREATE_COURSE, DELETE_COURSE } from '../../graphql/Mutation'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    // For some reason, this makes the 1fr sizing work without needing to hardcode heights of other
    // objects in the parent-level grid.
    overflow: 'hidden',
    gridTemplate: `"header    header  header"         64px
                   "______    ______  ______"         8px
                   "toolbar   toolbar toolbar"        48px
                   "_______   _______ _______"        8px
                   "courses  ____   newCourse" 1fr
                  / 1fr        16px   1fr`,
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

  const messageDispatch = useMessageStateValue()[1]

  const [courseInEdit, setCourseInEdit] = useState(null)

  const workspaceQuery = useQuery(WORKSPACE_FOR_EDIT, {
    variables: { id: workspaceId }
  })

  const deleteCourse = useMutation(DELETE_COURSE, {
    refetchQueries: [{
      query: WORKSPACE_FOR_EDIT, variables: { id: workspaceId }
    }]
  })

  if (workspaceQuery.loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
    )
  } else if (workspaceQuery.error) {
    return <NotFoundView message='Project not found' />
  }

  const handleChangeCourse = (course) => {
    setCourseInEdit(course)
  }

  return (
    <div className={classes.root}>
      <Typography className={classes.header} variant='h4'>
        Workspace: {workspaceQuery.data.workspaceById.name}
      </Typography>
      <span className={classes.toolbar}>
        TOOLBAR
      </span>
      <div className={classes.courses}>
        <CourseList
          courses={workspaceQuery.data.workspaceById.courses}
          handleChangeCourse={handleChangeCourse}
          courseInEdit={courseInEdit}
          deleteCourse={deleteCourse}
        />
      </div>
      <div className={classes.newCourse}>
        <CourseEditor courseInEdit={courseInEdit} />
      </div>
    </div>
  )
}

export default WorkspaceManagementView
