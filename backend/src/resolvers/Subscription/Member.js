import { withFilter } from 'graphql-subscriptions'

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
    (payload, variables) => payload.participant.workspaceId === variables.workspaceId)
}

export const workspaceMemberDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_MEMBER_DELETED),
    (payload, variables) => payload.participant.workspaceId === variables.workspaceId)
}

export const workspaceMemberUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_MEMBER_UPDATED),
    (payload, variables) => payload.workspaceMemberUpdated.workspaceId === variables.workspaceId)
}

export const projectMemberCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_MEMBER_CREATED),
    (payload, variables) => payload.participant.projectId === variables.projectId)
}

export const projectMemberDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_MEMBER_DELETED),
    (payload, variables) => payload.participant.projectId === variables.projectId)
}

export const projectMemberUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_MEMBER_UPDATED),
    (payload, variables) => payload.participant.projectId === variables.projectsId)
}

