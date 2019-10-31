import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { CONCEPT_CREATED, CONCEPT_UPDATED, CONCEPT_DELETED } from './config/channels'

export const conceptCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_CREATED),
    (payload, variables) => payload.conceptCreated.workspaceId === variables.workspaceId)
}

export const conceptUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_UPDATED),
    (payload, variables) => payload.conceptUpdated.workspaceId === variables.workspaceId)
}

export const conceptDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_DELETED),
    (payload, variables) => payload.conceptDeleted.workspaceId === variables.workspaceId)
}
