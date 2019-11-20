import { withFilter } from 'graphql-subscriptions'

import { canViewWorkspace } from '../../util/accessControl'
import { pubsub } from './config'
import { CONCEPT_CREATED, CONCEPT_UPDATED, CONCEPT_DELETED } from './config/channels'

export const conceptCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_CREATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.conceptCreated.workspaceId === variables.workspaceId
  )
}

export const conceptUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_UPDATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.conceptUpdated.workspaceId === variables.workspaceId)
}

export const conceptDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_DELETED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.conceptDeleted.workspaceId === variables.workspaceId)
}
