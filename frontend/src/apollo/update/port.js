import client from '../apolloClient'
import {
  WORKSPACES_BY_OWNER
} from '../../graphql/Query'

const includedIn = (set, object) =>
  set.map(p => p.id).includes(object.id)

const jsonPortUpdate = (ownerId) => {
  return (store, response) => {
    const workspaces = store.readQuery({
      query: WORKSPACES_BY_OWNER,
      variables: {
        ownerId: ownerId
      }
    })

    const updatedWorkspace = response.data.portData

    if (includedIn(workspaces.workspacesByOwner, updatedWorkspace)) {
      workspaces.map(workspace =>
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
  }
}

export {
  jsonPortUpdate
}
