import { withFilter } from 'graphql-subscriptions'

import { canViewWorkspace } from '../../util/accessControl'
import { pubsub } from './config'
import { WORKSPACE_UPDATED, WORKSPACE_DELETED } from './config/channels'

export const workspaceUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_UPDATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.workspaceUpdated.workspaceId === variables.workspaceId)
}

export const workspaceDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_DELETED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.workspaceDeleted.workspaceId === variables.workspaceId)
}
