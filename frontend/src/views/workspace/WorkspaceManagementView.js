import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { Typography, CircularProgress, Button } from '@material-ui/core'

import { WORKSPACE_BY_ID } from '../../graphql/Query'
import NotFoundView from '../error/NotFoundView'

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
  concepts: {
    gridArea: 'newCourse',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      overflow: 'auto'
    }
  }
}))

const WorkspaceManagementView = ({ workspaceId }) => {
  const classes = useStyles()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
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

  return (
    <div className={classes.root}>
      <Typography className={classes.header} variant='h4'>
        Workspace: {workspaceQuery.data.workspaceById.name}
      </Typography>
      <span className={classes.toolbar}>

      </span>
      <div className={classes.courses}>

      </div>
      <div className={classes.newCourse}>
      </div>
    </div>
  )
}

export default WorkspaceManagementView
