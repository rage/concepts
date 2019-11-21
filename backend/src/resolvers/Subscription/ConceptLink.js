import { withFilter } from 'graphql-subscriptions'

import { canViewWorkspace } from '../../util/accessControl'
import { pubsub } from './config'
import { CONCEPT_LINK_CREATED, CONCEPT_LINK_DELETED } from './config/channels'

export const conceptLinkCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_LINK_CREATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.conceptLinkCreated.workspaceId === variables.workspaceId)
}

export const conceptLinkDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_LINK_DELETED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.conceptLinkDeleted.workspaceId === variables.workspaceId)
}
