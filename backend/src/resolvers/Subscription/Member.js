import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { 
  MEMBER_JOINED_PROJECT, 
  MEMBER_LEFT_PROJECT,
  MEMBER_JOINED_WORKSPACE,
  MEMBER_LEFT_WORKSPACE
} from './config/channels'

export const memberJoinedWorkspace = {
  subscribe: withFilter(() => pubsub.asyncIterator(MEMBER_JOINED_WORKSPACE),
    (payload, variables) => payload.participant.workspaceId === variables.workspaceId)
}

export const memberLeftWorkspace = {
  subscribe: withFilter(() => pubsub.asyncIterator(MEMBER_LEFT_WORKSPACE),
    (payload, variables) => payload.participant.workspaceId === variables.workspaceId)
}

export const memberJoinedWorkspace = {
  subscribe: withFilter(() => pubsub.asyncIterator(MEMBER_JOINED_PROJECT),
    (payload, variables) => payload.participant.projectId === variables.projectId)
}

export const memberLeftProject = {
  subscribe: withFilter(() => pubsub.asyncIterator(MEMBER_LEFT_PROJECT),
    (payload, variables) => payload.participant.projectId === variables.projectId)
}

