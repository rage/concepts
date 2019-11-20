import { withFilter } from 'graphql-subscriptions'

import { canViewWorkspace } from '../../util/accessControl'
import { pubsub } from './config'
import { COURSE_LINK_CREATED, COURSE_LINK_UPDATED, COURSE_LINK_DELETED } from './config/channels'

export const courseLinkCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_CREATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.courseLinkCreated.workspaceId === variables.workspaceId)
}

export const courseLinkUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_UPDATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.courseLinkUpdated.workspaceId === variables.workspaceId)
}

export const courseLinkDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_DELETED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.courseLinkDeleted.workspaceId === variables.workspaceId)
}
