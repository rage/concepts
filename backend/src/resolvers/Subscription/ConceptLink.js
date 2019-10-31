import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { CONCEPT_LINK_CREATED, CONCEPT_LINK_DELETED } from './config/channels'

export const conceptLinkCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_LINK_CREATED),
    (payload, variables) => payload.conceptLinkCreated.workspaceId === variables.workspaceId)
}

export const conceptLinkDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_LINK_DELETED),
    (payload, variables) => payload.conceptLinkDeleted.workspaceId === variables.workspaceId)
}
