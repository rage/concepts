import client from '../apolloClient'
import {
  WORKSPACES_BY_OWNER,
  COURSES_BY_WORKSPACE
} from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const jsonPortUpdate = (ownerId) => {
  return (store, response) => {
    try {
      const workspaces = store.readQuery({
        query: WORKSPACES_BY_OWNER,
        variables: {
          ownerId: ownerId
        }
      })
      const updatedWorkspace = response.data.portData

      if (includedIn(workspaces.workspacesByOwner, updatedWorkspace)) {
        workspaces.workspacesByOwner.map(workspace =>
          workspace.id !== updatedWorkspace.id ? workspace : updatedWorkspace
        )
      } else {
        workspaces.workspacesByOwner.push(updatedWorkspace)
      }
      client.writeQuery({
        query: WORKSPACES_BY_OWNER,
        variables: {
          ownerId
        },
        data: workspaces
      })

      const courses = store.readQuery({
        query: COURSES_BY_WORKSPACE,
        variables: {
          workspaceId: updatedWorkspace.id
        }
      })

      updatedWorkspace.courses.forEach(course => {
        if (!includedIn(courses.coursesByWorkspace, course)) {
          courses.coursesByWorkspace.push(course)
        }
      })

      client.writeQuery({
        query: COURSES_BY_WORKSPACE,
        variables: {
          workspaceId: updatedWorkspace.id
        },
        data: courses
      })
    } catch (e) {
      return
    }
  }
}

export {
  jsonPortUpdate
}
