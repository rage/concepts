import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { PROJECT_BY_ID } from '../../graphql/Query/Project'
import { makeStyles } from '@material-ui/core/styles'

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
  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
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
              style={{ backgroundColor: 'red', gridArea: 'templates' }}
            >
              <div id={'templateHeader'}>
                <h3>TEMPLATES</h3>
                <div id={'createTemplateButton'}></div>
              </div>
              <div id={'templateList'}>
                LIST HERE
              </div>
            </div>
            <div id={'userWorkspaces'}
              style={{ backgroundColor: 'green', gridArea: 'userWorkspaces' }}
            >
              <div id={'userWorkspaceHeader'}>
                <h3>USER WORKSPACES</h3>
                <div id={'userWorkspaceFilters'}></div>
              </div>
              <div id={'userWorkspaceList'}>
                LIST HERE
              </div>
            </div>
          </div>
          :
          null
      }
    </>
  )
}

export default ProjectView
