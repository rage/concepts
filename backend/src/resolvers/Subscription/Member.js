import { withFilter } from 'graphql-subscriptions'

import { canViewWorkspace, canViewProject } from '../../util/accessControl'
import { pubsub } from './config'
import {
  PROJECT_MEMBER_CREATED,
  PROJECT_MEMBER_DELETED,
  WORKSPACE_MEMBER_CREATED,
  WORKSPACE_MEMBER_DELETED,
  PROJECT_MEMBER_UPDATED,
  WORKSPACE_MEMBER_UPDATED
} from './config/channels'

export const workspaceMemberCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_MEMBER_CREATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.workspaceMemberCreated.workspaceId === variables.workspaceId)
}

export const workspaceMemberDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_MEMBER_DELETED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.workspaceMemberDeleted.workspaceId === variables.workspaceId)
}

export const workspaceMemberUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_MEMBER_UPDATED),
    async (payload, variables, ctx) => await canViewWorkspace(ctx, variables.workspaceId)
      && payload.workspaceMemberUpdated.workspaceId === variables.workspaceId)
}

export const projectMemberCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_MEMBER_CREATED),
    async (payload, variables, ctx) => await canViewProject(ctx, variables.projectId)
      && payload.projectMemberCreated.projectId === variables.projectId)
}

export const projectMemberDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_MEMBER_DELETED),
    async (payload, variables, ctx) => await canViewProject(ctx, variables.projectId)
      && payload.projectMemberDeleted.projectId === variables.projectId)
}

export const projectMemberUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_MEMBER_UPDATED),
    async (payload, variables, ctx) => await canViewProject(ctx, variables.projectId)
      && payload.projectMemberUpdated.projectId === variables.projectsId)
}
