import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'

import { Typography, CircularProgress } from '@material-ui/core'

import { PROJECT_AND_DATA } from '../../graphql/Query'
import {
  CREATE_SHARE_LINK, DELETE_SHARE_LINK, DELETE_TEMPLATE_WORKSPACE
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
    gridTemplate: `"header     header"         64px
                   "toolbar    toolbar"        48px
                   "templates  userWorkspaces" 1fr
                  / 1fr        1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    }
  },
  header: {
    gridArea: 'header',
    backgroundColor: 'cyan'
  },
  toolbar: {
    gridArea: 'toolbar',
    backgroundColor: 'blue'
  },
  templates: {
    gridArea: 'templates'
  },
  userWorkspaces: {
    gridArea: 'userWorkspaces',
    backgroundColor: 'green'
  }
}))

const ProjectView = ({ projectId }) => {
  const projectQuery = useQuery(PROJECT_AND_DATA, {
    variables: { id: projectId }
  })

  const createShareLink = useMutation(CREATE_SHARE_LINK, {
    refetchQueries: [{
      query: PROJECT_AND_DATA
    }]
  })

  const deleteShareLink = useMutation(DELETE_SHARE_LINK, {
    refetchQueries: [{
      query: PROJECT_AND_DATA
    }]
  })

  const deleteTemplateWorkspace = useMutation(DELETE_TEMPLATE_WORKSPACE, {
    refetchQueries: [{
      query: PROJECT_AND_DATA
    }]
  })

  const classes = useStyles()

  return projectQuery.data.projectById ?
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant='h4'>Project: {projectQuery.data.projectById.name}</Typography>
      </div>
      <div className={classes.toolbar} id={'toolbar'}>
        <div className={classes.participantManager}>
          {/* TODO */}
        </div>
      </div>
      <div className={classes.templates}>
        <TemplateList
          projectId={projectId}
          templateWorkspaces={projectQuery.data.projectById.templates ?
            projectQuery.data.projectById.templates : []}
          createShareLink={createShareLink}
          deleteShareLink={deleteShareLink}
          deleteTemplateWorkspace={deleteTemplateWorkspace}
        />
      </div>
      <div className={classes.userWorkspaces}>
        <UserWorkspaceList
          userWorkspaces={projectQuery.data.projectById.workspaces ?
            projectQuery.data.projectById.workspaces : []}
        />
      </div>
    </div>
    :
    <div style={{ textAlign: 'center' }}>
      <CircularProgress />
    </div>
}

export default ProjectView
