import { Privilege } from '../../lib/permissions'
import client from '../apolloClient'
import {
  WORKSPACES_FOR_USER,
  PROJECT_BY_ID
} from '../../graphql/Query'

const jsonPortUpdate = (store, response) => {
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
  } catch (e) {
    console.error('jsonPortUpdate', e)
  }
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
    } catch (e) {
      console.error('jsonTemplatePortUpdate', e)
    }
  }

export {
  jsonPortUpdate,
  jsonTemplatePortUpdate
}
