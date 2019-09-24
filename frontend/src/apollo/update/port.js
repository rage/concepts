import { Privilege } from '../../lib/permissions'
import client from '../apolloClient'
import {
  WORKSPACES_FOR_USER,
  COURSES_BY_WORKSPACE,
  PROJECT_BY_ID
} from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const jsonPortUpdate = () =>
  (store, response) => {
    try {
      const data = store.readQuery({
        query: WORKSPACES_FOR_USER
      })
      const updatedWorkspace = response.data.importData

      if (data.workspacesForUser.map(p => p.workspace.id).includes(updatedWorkspace.id)) {
        data.workspacesForUser.map(p =>
          p.workspace.id !== updatedWorkspace.id ? p : {
            privilege: p.privilege || Privilege.OWNER.toString(),
            updatedWorkspace,
            __typename: 'WorkspaceParticipant'
          }
        )
      } else {
        data.workspacesForUser.push({
          privilege: Privilege.OWNER.toString(),
          workspace: updatedWorkspace,
          __typename: 'WorkspaceParticipant'
        })
      }
      client.writeQuery({
        query: WORKSPACES_FOR_USER,
        data
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
    } catch (e) {}
  }

const jsonTemplatePortUpdate = (projectId) =>
  (store, response) => {
    try {
      const updatedWorkspace = response.data.importData
      if (updatedWorkspace.asTemplate) {
        const project = store.readQuery({
          query: PROJECT_BY_ID,
          variables: {
            id: projectId
          }
        })
        if (!project.projectById.templates.includes(updatedWorkspace.id)) {
          project.projectById.templates.push(updatedWorkspace)
        }
        client.writeQuery({
          query: PROJECT_BY_ID,
          variables: {
            id: projectId
          },
          data: project
        })
      }
    } catch (e) {}
  }

export {
  jsonPortUpdate,
  jsonTemplatePortUpdate
}
