import { WORKSPACE_BY_ID } from '../../graphql/Query'
import client from '../apolloClient'

const updateWorkspaceUpdate = (workspaceId) =>
  (store, response) => {
    try {
      const data = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: {
          ...data,
          workspaceById: {
            ...data.workspaceById,
            ...response.data.updateWorkspace
          }
        }
      })
    } catch (e) {
      console.error('updateWorkspaceUpdate', e)
    }
  }

export { updateWorkspaceUpdate }
