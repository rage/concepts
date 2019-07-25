import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'

import { Typography, CircularProgress } from '@material-ui/core'

import { PROJECT_BY_ID } from '../../graphql/Query'
import {
  CREATE_SHARE_LINK, DELETE_SHARE_LINK, DELETE_TEMPLATE_WORKSPACE, SET_ACTIVE_TEMPLATE
} from '../../graphql/Mutation'

import UserWorkspaceList from './UserWorkspaceList'
import TemplateList from './TemplateList'

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
                   "______    ______  ______"        8px
                   "toolbar   toolbar toolbar"        48px
                   "_______   _______ _______"        8px
                   "templates  ____   userWorkspaces" 1fr
                  / 1fr        16px   1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    }
  },
  header: {
    gridArea: 'header',
    margin: '16px'
  },
  toolbar: {
    gridArea: 'toolbar',
    backgroundColor: 'white'
  },
  templates: {
    gridArea: 'templates',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      overflow: 'auto'
    }
  },
  userWorkspaces: {
    gridArea: 'userWorkspaces',
    overflow: 'hidden',
    '& > div': {
      height: '100%',
      overflow: 'auto'
    }
  }
}))

const ProjectView = ({ projectId }) => {
  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
  })

  const createShareLink = useMutation(CREATE_SHARE_LINK, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
  })

  const deleteShareLink = useMutation(DELETE_SHARE_LINK, {
    refetchQueries: [{
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    }]
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

  const classes = useStyles()

  return projectQuery.data.projectById ?
    <div className={classes.root}>
      <Typography className={classes.header} variant='h4'>
        Project: {projectQuery.data.projectById.name}
      </Typography>
      <div className={classes.toolbar}>
        <Typography variant='h6'>TODO: Toolbar</Typography>
      </div>
      <div className={classes.templates}>
        <TemplateList
          projectId={projectId}
          activeTemplate={projectQuery.data.projectById.activeTemplate}
          templateWorkspaces={projectQuery.data.projectById.templates}
          createShareLink={createShareLink}
          deleteShareLink={deleteShareLink}
          deleteTemplateWorkspace={deleteTemplateWorkspace}
          setActiveTemplate={setActiveTemplate}
        />
      </div>
      <div className={classes.userWorkspaces}>
        <UserWorkspaceList userWorkspaces={projectQuery.data.projectById.workspaces || []} />
      </div>
    </div>
    :
    <div style={{ textAlign: 'center' }}>
      <CircularProgress />
    </div>
}

export default ProjectView
