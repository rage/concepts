import React from 'react'
import { Redirect } from 'react-router-dom'
import { useQuery } from 'react-apollo-hooks'
import { WORKSPACE_BY_ID } from '../../graphql/Query/Workspace'

import WorkspaceDefaultCourseForm from './WorkspaceDefaultCourseForm'


const WorkspaceView = ({ workspaceId, location }) => {
  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: {
      id: workspaceId
    }
  })

  return (
    <React.Fragment>
      {
        workspaceQuery.data.workspaceById ?
          workspaceQuery.data.workspaceById.defaultCourse ?
            <Redirect to={{
              pathname: `${location.pathname}/${workspaceQuery.data.workspaceById.defaultCourse.id}`,
              state: { from: location }
            }} />
            : <WorkspaceDefaultCourseForm workspaceId={workspaceId} />
          : null
      }
    </React.Fragment>
  )
}

export default WorkspaceView