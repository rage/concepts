import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { WORKSPACE_CREATED, WORKSPACE_UPDATED, WORKSPACE_DELETED } from './config/channels'

const WorkspaceSubscriptions = {
  projectWorkspaceCreated: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_CREATED),
      (payload, variables) => payload.workspaceCreated.projectId === variables.projectId)
  },
  workspaceUpdated: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_UPDATED),
      (payload, variables) => payload.workspaceUpdated.id === variables.workspaceId)
  },
  workspaceDeleted: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_DELETED),
      (payload, variables) => payload.workspaceDeleted.id === variables.workspaceId)
  },
  projectWorkspaceUpdated: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_UPDATED),
      (payload, variables) => payload.workspaceUpdated.projectId === variables.projectId)
  },
  projectWorkspaceDeleted: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_DELETED),
      (payload, variables) => payload.workspaceDeleted.projectId === variables.projectId)
  }
}

module.exports = WorkspaceSubscriptions
