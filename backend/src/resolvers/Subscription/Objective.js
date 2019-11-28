import { withFilter } from 'graphql-subscriptions'

import { canViewWorkspace } from '../../util/accessControl'
import { pubsub } from './config'
import { OBJECTIVE_CREATED, OBJECTIVE_UPDATED, OBJECTIVE_DELETED } from './config/channels'

export const objectiveCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(OBJECTIVE_CREATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.objectiveCreated.workspaceId === variables.workspaceId
  )
}

export const objectiveUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(OBJECTIVE_UPDATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.objectiveUpdated.workspaceId === variables.workspaceId)
}

export const objectiveDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(OBJECTIVE_DELETED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.objectiveDeleted.workspaceId === variables.workspaceId)
}
