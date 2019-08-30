import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from 'react-apollo-hooks'
import { Typography } from '@material-ui/core'

import { PROJECT_BY_ID } from '../../../graphql/Query'
import NotFoundView from '../../error/NotFoundView'
import LoadingBar from '../../../components/LoadingBar'

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
    gridTemplate: `"header  header" 56px
                   "sharing points" 1fr
                  / 1fr       1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    },
    '& > div': {
      overflow: 'hidden'
    },
    '&.hideToolbar': {
      gridTemplateRows: '56px 0 1fr 1fr'
    }
  },
  header: {
    gridArea: 'header',
    margin: '16px 0 0',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  sharing: {
    gridArea: 'sharing'
  },
  points: {
    gridArea: 'points'
  }
}))

const ProjectManagerView = ({ projectId }) => {
  const classes = useStyles()

  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
  })

  if (projectQuery.loading) {
    return <LoadingBar id='project-manager-view' />
  } else if (projectQuery.error) {
    return <NotFoundView message='Project not found' />
  }

  return (
    <div className={classes.root}>
      <Typography className={classes.header} variant='h4'>
        Project: {projectQuery.data.projectById.name}
      </Typography>
      <div className={classes.sharing}>
        TODO
      </div>
      <div className={classes.points}>
        TODO
      </div>
    </div>
  )
}

export default ProjectManagerView
