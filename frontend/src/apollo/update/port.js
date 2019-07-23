import client from '../apolloClient'
import {
  WORKSPACES_FOR_USER,
  COURSES_BY_WORKSPACE
} from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const jsonPortUpdate = () => {
  return (store, response) => {
    try {
      const workspaces = store.readQuery({
        query: WORKSPACES_FOR_USER
      })
      const updatedWorkspace = response.data.importData

      if (includedIn(workspaces.workspacesForUser, updatedWorkspace)) {
        workspaces.workspacesForUser.map(workspace =>
          workspace.id !== updatedWorkspace.id ? workspace : updatedWorkspace
        )
      } else {
        workspaces.workspacesForUser.push(updatedWorkspace)
      }
      client.writeQuery({
        query: WORKSPACES_FOR_USER,
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
