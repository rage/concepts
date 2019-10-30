import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { COURSE_CREATED, COURSE_UPDATED, COURSE_DELETED } from './config/channels'

export const courseCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_CREATED),
    (payload, variables) => payload.courseCreated.workspaceId === variables.workspaceId)
}

export const courseUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_UPDATED),
    (payload, variables) => payload.courseUpdated.workspaceId === variables.workspaceId)
}

export const courseDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_DELETED),
    (payload, variables) => payload.courseDeleted.workspaceId === variables.workspaceId)
}
