import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { WORKSPACE_UPDATED, WORKSPACE_DELETED } from './config/channels'

export const workspaceUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_UPDATED),
    (payload, variables) => payload.workspaceUpdated.workspaceId === variables.workspaceId)
}

export const workspaceDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_DELETED),
    (payload, variables) => payload.workspaceDeleted.workspaceId === variables.workspaceId)
}
