import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { Typography, CircularProgress, Button } from '@material-ui/core'

import { PROJECT_BY_ID } from '../../graphql/Query'
import {
  CREATE_SHARE_LINK, DELETE_SHARE_LINK, DELETE_TEMPLATE_WORKSPACE,
  SET_ACTIVE_TEMPLATE, CREATE_PROJECT_SHARE_LINK
} from '../../graphql/Mutation'
import UserWorkspaceList from './UserWorkspaceList'
import TemplateList from './TemplateList'
import ProjectSharingDialog from './ProjectSharingDialog'

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
    margin: '16px 0'
  },
  toolbar: {
    gridArea: 'toolbar'
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

const projectShareTitle = 'Share project'
const projectShareDescription = 'Let other users view and edit your project'
const projectCloneTitle = 'Invite students'
const projectCloneDescription = `
Let students clone the active template to 
contribute towards the mapping.
`

const ProjectView = ({ projectId }) => {
  const [shareState, setShareState] = useState({ open: false })
  const [cloneState, setCloneState] = useState({ open: false })

  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
  })

  const createWorkspaceShareLink = useMutation(CREATE_SHARE_LINK, {
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

  const createProjectShareLink = useMutation(CREATE_PROJECT_SHARE_LINK, {
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



  const openProjectShareDialog = () => {
    setShareState({
      open: true
    })
  }

  const openProjectCloneDialog = () => {
    setCloneState({
      open: true
    })
  }

  const closeProjectShareDialog = () => {
    setShareState({
      open: false
    })
  }
  const closeProjectCloneDialog = () => {
    setCloneState({
      open: false
    })
  }

  const classes = useStyles()

  return (
    projectQuery.data.projectById ?
      <>
        <div className={classes.root}>
          <Typography className={classes.header} variant='h4'>
            Project: {projectQuery.data.projectById.name}
          </Typography>
          <span className={classes.toolbar}>
            <Button color='primary' variant='contained' onClick={openProjectShareDialog}>
              Share project
            </Button>
          </span>
          <div className={classes.templates}>
            <TemplateList
              projectId={projectId}
              activeTemplate={projectQuery.data.projectById.activeTemplate}
              templateWorkspaces={projectQuery.data.projectById.templates}
              createShareLink={createWorkspaceShareLink}
              deleteShareLink={deleteShareLink}
              deleteTemplateWorkspace={deleteTemplateWorkspace}
              setActiveTemplate={setActiveTemplate}
            />
          </div>
          <div className={classes.userWorkspaces}>
            <UserWorkspaceList
              projectId={projectId}
              openProjectCloneDialog={openProjectCloneDialog}
              userWorkspaces={projectQuery.data.projectById.workspaces}
              activeTemplate={projectQuery.data.projectById.activeTemplate}
            />
          </div>
        </div>
        <ProjectSharingDialog
          open={shareState.open}
          privilege='EDIT'
          title={projectShareTitle}
          description={projectShareDescription}
          project={projectQuery.data.projectById}
          handleClose={closeProjectShareDialog}
          createProjectShareLink={createProjectShareLink}
          deleteProjectShareLink={deleteShareLink}
        />
        <ProjectSharingDialog
          open={cloneState.open}
          privilege='CLONE'
          title={projectCloneTitle}
          description={projectCloneDescription}
          project={projectQuery.data.projectById}
          handleClose={closeProjectCloneDialog}
          createProjectShareLink={createProjectShareLink}
          deleteProjectShareLink={deleteShareLink}
        />
      </>
      :
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
  )
}

export default ProjectView
