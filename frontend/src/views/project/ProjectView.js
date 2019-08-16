import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { Typography, CircularProgress, Button } from '@material-ui/core'

import { PROJECT_BY_ID } from '../../graphql/Query'
import { DELETE_TEMPLATE_WORKSPACE, SET_ACTIVE_TEMPLATE } from '../../graphql/Mutation'
import UserWorkspaceList from './UserWorkspaceList'
import TemplateList from './TemplateList'
import { useShareDialog } from '../../dialogs/sharing'
import NotFoundView from '../error/NotFoundView'
import MergeList from './MergeList'

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
    gridTemplate: `"header    header"         56px
                   "toolbar   toolbar"        40px
                   "templates userWorkspaces" 1fr
                   "merges    userWorkspaces" 1fr
                  / 1fr       1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    },
    '& > div': {
      overflow: 'hidden',
      '& > div': {
        height: '100%',
        overflow: 'auto'
      }
    }
  },
  header: {
    gridArea: 'header',
    margin: '16px 0'
  },
  toolbar: {
    gridArea: 'toolbar'
  },
  templates: {
    gridArea: 'templates'
  },
  merges: {
    gridArea: 'merges'
  },
  userWorkspaces: {
    gridArea: 'userWorkspaces'
  }
}))

const ProjectView = ({ projectId }) => {
  const classes = useStyles()
  const openShareProjectDialog = useShareDialog('project')

  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
  })

  const deleteTemplateWorkspace = useMutation(DELETE_TEMPLATE_WORKSPACE, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })

  const setActiveTemplate = useMutation(SET_ACTIVE_TEMPLATE, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })

  if (projectQuery.loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
    )
  } else if (projectQuery.error) {
    return <NotFoundView message='Project not found' />
  }

  return (
    <div className={classes.root}>
      <Typography className={classes.header} variant='h4'>
        Project: {projectQuery.data.projectById.name}
      </Typography>
      <span className={classes.toolbar}>
        <Button
          color='primary' variant='contained'
          onClick={() => openShareProjectDialog(projectId, 'EDIT')}
        >
          Share project
        </Button>
      </span>
      <div className={classes.templates}>
        <TemplateList
          projectId={projectId}
          activeTemplate={projectQuery.data.projectById.activeTemplate}
          templateWorkspaces={projectQuery.data.projectById.templates}
          deleteTemplateWorkspace={deleteTemplateWorkspace}
          setActiveTemplate={setActiveTemplate}
        />
      </div>
      <div className={classes.merges}>
        <MergeList
          projectId={projectId}
          activeTemplate={projectQuery.data.projectById.activeTemplate}
          mergeWorkspaces={projectQuery.data.projectById.merges}
        />
      </div>
      <div className={classes.userWorkspaces}>
        <UserWorkspaceList
          projectId={projectId}
          userWorkspaces={projectQuery.data.projectById.workspaces}
          activeTemplate={projectQuery.data.projectById.activeTemplate}
        />
      </div>
    </div>
  )
}

export default ProjectView
