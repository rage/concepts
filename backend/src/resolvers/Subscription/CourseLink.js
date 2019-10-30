import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { COURSE_LINK_CREATED, COURSE_LINK_UPDATED, COURSE_LINK_DELETED } from './config/channels'

export const courseLinkCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_CREATED),
    (payload, variables) => payload.courseLinkCreated.workspaceId === variables.workspaceId)
}

export const courseLinkUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_UPDATED),
    (payload, variables) => payload.courseLinkUpdated.workspaceId === variables.workspaceId)
}

export const courseLinkDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_DELETED),
    (payload, variables) => payload.courseLinkDeleted.workspaceId === variables.workspaceId)
}
