import React from 'react'
import { Redirect } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'

import { WORKSPACE_BY_ID } from '../../../graphql/Query/Workspace'
import CreateCourseForm from './CreateCourseForm'
import NotFoundView from '../../error/NotFoundView'
import LoadingBar from '../../../components/LoadingBar'
import useRouter from '../../../lib/useRouter'

const MapperRedirectView = ({ workspaceId, urlPrefix }) => {
  const { location } = useRouter()
  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: {
      id: workspaceId
    }
  })

  if (workspaceQuery.loading) {
    return <LoadingBar id='mapper-view' />
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
