import React from 'react'
import { Redirect } from 'react-router-dom'
import { useQuery } from 'react-apollo-hooks'
import { CircularProgress } from '@material-ui/core'

import { WORKSPACE_BY_ID } from '../../../graphql/Query/Workspace'
import CreateCourseForm from './CreateCourseForm'
import NotFoundView from '../../error/NotFoundView'

const MapperRedirectView = ({ workspaceId, location, urlPrefix }) => {
  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: {
      id: workspaceId
    }
  })

  if (workspaceQuery.loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
    )
  } else if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  }

  return workspaceQuery.data.workspaceById.courses.length > 0
    ? <Redirect to={{
      pathname: `${location.pathname}/${workspaceQuery.data.workspaceById.courses[0].id}`,
      state: { from: location }
    }} />
    : <CreateCourseForm urlPrefix={urlPrefix} workspaceId={workspaceId} />
}

export default MapperRedirectView
