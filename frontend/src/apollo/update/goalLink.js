import client from '../apolloClient'
import { WORKSPACE_BY_ID } from '../../graphql/Query'

const createGoalLinkUpdate = workspaceId =>
  (store, response) => {
    try {
      const createGoalLink = response.data.createGoalLink
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const ws = dataInStore.workspaceById
      ws.goalLinks = ws.goalLinks.concat(createGoalLink)
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: dataInStore
      })
    } catch (e) {
      console.error('createGoalLinkUpdate', e)
    }
  }

const deleteGoalLinkUpdate = workspaceId =>
  (store, response) => {
    try {
      const deleteGoalLink = response.data.deleteGoalLink
      const dataInStore = store.readQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId }
      })
      const ws = dataInStore.workspaceById
      ws.goalLinks = ws.goalLinks.filter(goalLink => goalLink.id !== deleteGoalLink.id)
      client.writeQuery({
        query: WORKSPACE_BY_ID,
        variables: { id: workspaceId },
        data: dataInStore
      })
    } catch (e) {
      console.error('deleteGoalLinkUpdate', e)
    }
  }

export {
  createGoalLinkUpdate,
  deleteGoalLinkUpdate
}
