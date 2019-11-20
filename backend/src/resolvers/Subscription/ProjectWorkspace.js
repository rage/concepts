import { withFilter } from 'graphql-subscriptions'

import { canViewProject } from '../../util/accessControl'
import { pubsub } from './config'
import {
  PROJECT_WORKSPACE_CREATED, PROJECT_WORKSPACE_UPDATED, PROJECT_WORKSPACE_DELETED
} from './config/channels'

export const projectWorkspaceCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_CREATED),
    async (payload, variables, ctx) => await canViewProject(ctx, variables.projectId)
      && payload.projectWorkspaceCreated.pId === variables.projectId)
}

export const projectWorkspaceUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_UPDATED),
    async (payload, variables, ctx) => await canViewProject(ctx, variables.projectId)
      && payload.projectWorkspaceUpdated.pId === variables.projectId)
}

export const projectWorkspaceDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_DELETED),
    async (payload, variables, ctx) => await canViewProject(ctx, variables.projectId)
      && payload.projectWorkspaceDeleted.pId === variables.projectId)
}
