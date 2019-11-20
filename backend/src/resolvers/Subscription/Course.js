import { withFilter } from 'graphql-subscriptions'

import { canViewWorkspace } from '../../util/accessControl'
import { pubsub } from './config'
import { COURSE_CREATED, COURSE_UPDATED, COURSE_DELETED } from './config/channels'

export const courseCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_CREATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.courseCreated.workspaceId === variables.workspaceId)
}

export const courseUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_UPDATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.courseUpdated.workspaceId === variables.workspaceId)
}

export const courseDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(COURSE_DELETED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.courseDeleted.workspaceId === variables.workspaceId)
}
