import React from 'react'

import { useQuery, useMutation } from 'react-apollo-hooks'
import { PROJECT_AND_DATA } from '../../graphql/Query'
import { CREATE_SHARE_LINK, DELETE_SHARE_LINK, DELETE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'
import UserWorkspaceList from './UserWorkspaceList'
import { makeStyles } from '@material-ui/core/styles'

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
    gridTemplate: `"projectHeader projectHeader"  64px
                   "toolbar       toolbar"        48px
                   "templates     userWorkspaces" 1fr
                   / 1fr 1fr`
    // '@media screen and (max-width: 1000px)': {
    //   gridTemplateColumns: '32% auto 32'
    // }
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

  return (
    <>
      {
        projectQuery.data.projectById ?
          <div id={'projectView'} className={classes.root}>
            <div id={'projectHeader'}
              style={{ gridArea: 'projectHeader', backgroundColor: 'cyan' }}
            >
              <h1>
                {`Project: ${projectQuery.data.projectById.name}`}
              </h1>
            </div>
            <div id={'toolbar'}
              style={{ gridArea: 'toolbar', backgroundColor: 'blue' }}
            >
              <div id={'participantManager'}></div>
            </div>
            <div id={'templates'}
              style={{ margin: '0px 14px 0px 14px', gridArea: 'templates' }}
            >
              <TemplateList
                projectId={projectId}
                templateWorkspaces={projectQuery.data.projectById.templates ?
                  projectQuery.data.projectById.templates : []}
                createShareLink={createShareLink}
                deleteShareLink={deleteShareLink}
                deleteTemplateWorkspace={deleteTemplateWorkspace}
              />
            </div>
            <div id={'userWorkspaces'}
              style={{ backgroundColor: 'green', gridArea: 'userWorkspaces' }}
            >
              <UserWorkspaceList
                userWorkspaces={projectQuery.data.projectById.workspaces ?
                  projectQuery.data.projectById.workspaces : []}
              />
            </div>
          </div>
          :
          null
      }
    </>
  )
}

export default ProjectView
