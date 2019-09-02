import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { Typography } from '@material-ui/core'

import { PROJECT_BY_ID } from '../../../graphql/Query'
import { CREATE_POINTGROUP, UPDATE_POINTGROUP,
  DELETE_POINTGROUP
} from '../../../graphql/Mutation'
import NotFoundView from '../../error/NotFoundView'
import LoadingBar from '../../../components/LoadingBar'
import EditableTable from './EditableTable'

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

  const [courseForPoints, setCourseForPoints] = useState(null)

  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
  })

  const createPointGroup = useMutation(CREATE_POINTGROUP, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  const updatePointGroup = useMutation(UPDATE_POINTGROUP, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  const deletePointGroup = useMutation(DELETE_POINTGROUP, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  const columns = [
    { title: 'Group', field: 'name', type: 'text', minWidth: '80px' },
    { title: 'Start date', field: 'startDate', type: 'date', minWidth: '80px' },
    { title: 'End date', field: 'endDate', type: 'date', minWidth: '80px' },
    { title: 'Max points', field: 'maxPoints', type: 'number', min: '0', minWidth: '40px' },
    {
      title: 'Points per concept',
      field: 'pointsPerConcept',
      type: 'number',
      step: '0.1',
      min: '0.0',
      minWidth: '40px'
    }
  ]

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
        <EditableTable
          columns={columns}
          createMutation={args => createPointGroup({ variables: {
            workspaceId: projectQuery.data.projectById.activeTemplate.id,
            courseId: projectQuery.data.projectById.activeTemplate.courses[0].id,
            ...args
          } })}
          updateMutation={args => updatePointGroup({ variables: { ...args } })}
          deleteMutation={args => deletePointGroup({ variables: { ...args } })}
          rows={projectQuery.data.projectById.activeTemplate.pointGroups}
        />
      </div>
    </div>
  )
}

export default ProjectManagerView
