import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { WORKSPACE_CREATED, WORKSPACE_UPDATED, WORKSPACE_DELETED, PROJECT_WORKSPACE_CLONED} from './config/channels'

export const projectWorkspaceCloned = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_CLONED),
    (payload, variables) => payload.workspaceCreated.pId === variables.projectId)
}

export const projectWorkspaceCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_CREATED),
    (payload, variables) => payload.workspaceCreated.pId === variables.projectId)
}

export const workspaceUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_UPDATED),
    (payload, variables) => payload.workspaceUpdated.workspaceId === variables.workspaceId)
}

export const workspaceDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_DELETED),
    (payload, variables) => payload.workspaceDeleted.workspaceId === variables.workspaceId)
}

export const projectWorkspaceUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_UPDATED),
    (payload, variables) => payload.workspaceUpdated.pId === variables.projectId)
}

export const projectWorkspaceDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_DELETED),
    (payload, variables) => payload.workspaceDeleted.pId === variables.projectId)
}
