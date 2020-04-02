import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from '@apollo/react-hooks'
import { Typography, Button } from '@material-ui/core'

import { Privilege } from '../../lib/permissions'
import { PROJECT_BY_ID } from '../../graphql/Query'
import UserWorkspaceList from './UserWorkspaceList'
import { useShareDialog } from '../../dialogs/sharing'
import NotFoundView from '../error/NotFoundView'
import TemplateList from './TemplateList'
import MergeList from './MergeList'
import { useLoginStateValue } from '../../lib/store'
import LoadingBar from '../../components/LoadingBar'
import { useInfoBox } from '../../components/InfoBox'
import { useUpdatingSubscription } from '../../apollo/useUpdatingSubscription'

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
      overflow: 'hidden'
    },
    '&$hideToolbar': {
      gridTemplateRows: '56px 0 1fr 1fr'
    }
  },
  hideToolbar: {},
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
  templates: {
    gridArea: 'templates',
    overflow: 'hidden'
  },
  merges: {
    gridArea: 'merges',
    overflow: 'hidden'
  },
  userWorkspaces: {
    gridArea: 'userWorkspaces',
    overflow: 'hidden'
  }
}))

const ProjectView = ({ projectId }) => {
  const classes = useStyles()
  const openShareProjectDialog = useShareDialog('project')
  const [{ user }] = useLoginStateValue()
  const infoBox = useInfoBox()

  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
  })

  useUpdatingSubscription('project workspace', 'create', {
    variables: { projectId },
    update: (client, response) => {
      const createdWorkspace = response.data.createProjectWorkspace
      const data = client.readQuery({
        query: PROJECT_BY_ID,
        variables: { id: projectId }
      })

      let type
      if (createdWorkspace.asTemplate?.id === projectId) type = 'template'
      else if (createdWorkspace.asMerge?.id === projectId) type = 'merge'
      else if (createdWorkspace.sourceProject?.id === projectId) type = 'workspace'

      if (!data.projectById[`${type}s`].find(workspace => workspace.id === createdWorkspace.id)) {
        data.projectById[`${type}s`].push(createdWorkspace)
      }

      client.writeQuery({
        query: PROJECT_BY_ID,
        variables: { id: projectId },
        data
      })
    }
  })

  useEffect(() => {
    infoBox.setView('project')
    return () => infoBox.unsetView('project')
  }, [infoBox])

  if (projectQuery.loading) {
    return <LoadingBar id='project-view' />
  } else if (projectQuery.error) {
    return <NotFoundView message='Project not found' />
  }

  const showToolbar = projectQuery.data.projectById.participants.find(participant =>
    participant.user.id === user.id && participant.privilege === Privilege.OWNER
  )

  return (
    <main className={`${classes.root} ${showToolbar ? '' : classes.hideToolbar}`}>
      <Typography className={classes.header} variant='h4'>
        Project: {projectQuery.data.projectById.name}
      </Typography>
      {
        showToolbar &&
          <span className={classes.toolbar}>
            <Button
              color='primary' variant='contained'
              onClick={() => openShareProjectDialog(projectId, Privilege.EDIT)}
            >
              Share project
            </Button>
          </span>
      }
      <section className={classes.templates}>
        <TemplateList
          projectId={projectId}
          activeTemplate={projectQuery.data.projectById.activeTemplate}
          templateWorkspaces={projectQuery.data.projectById.templates}
          urlPrefix={`/projects/${projectId}/templates`}
        />
      </section>
      <section className={classes.merges}>
        <MergeList
          projectId={projectId}
          activeTemplate={projectQuery.data.projectById.activeTemplate}
          mergeWorkspaces={projectQuery.data.projectById.merges}
          canMerge={projectQuery.data.projectById.workspaces.length > 0}
          urlPrefix={`/projects/${projectId}/merges`}
        />
      </section>
      <section className={classes.userWorkspaces}>
        <UserWorkspaceList
          projectId={projectId}
          userWorkspaces={projectQuery.data.projectById.workspaces}
          activeTemplate={projectQuery.data.projectById.activeTemplate}
          templateNames={new Map(projectQuery.data.projectById.templates
            .map(tpl => [tpl.id, tpl.name]))}
          urlPrefix={`/projects/${projectId}/workspaces`}
        />
      </section>
    </main>
  )
}

export default ProjectView
