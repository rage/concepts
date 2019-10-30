import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { WORKSPACE_CREATED, WORKSPACE_UPDATED, WORKSPACE_DELETED } from './config/channels'

const WorkspaceSubscriptions = {
  projectWorkspaceCreated: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_CREATED),
      (payload, variables) => payload.workspaceCreated.pId === variables.projectId)
  },
  workspaceUpdated: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_UPDATED),
      (payload, variables) => payload.workspaceUpdated.workspaceId === variables.workspaceId)
  },
  workspaceDeleted: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_DELETED),
      (payload, variables) => payload.workspaceDeleted.workspaceId === variables.workspaceId)
  },
  projectWorkspaceUpdated: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_UPDATED),
      (payload, variables) => payload.workspaceUpdated.pId === variables.projectId)
  },
  projectWorkspaceDeleted: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_DELETED),
      (payload, variables) => payload.workspaceDeleted.pId === variables.projectId)
  }
}

module.exports = WorkspaceSubscriptions
