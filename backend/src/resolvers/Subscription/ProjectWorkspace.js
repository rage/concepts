import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import { PROJECT_WORKSPACE_CREATED, PROJECT_WORKSPACE_UPDATED, PROJECT_WORKSPACE_DELETED, PROJECT_CLONED } from './config/channels'


export const projectWorkspaceCloned = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_CLONED),
    (payload, variables) => payload.workspaceCloned.pId === variables.projectId)
}

export const projectWorkspaceCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_CREATED),
    (payload, variables) => payload.workspaceCreated.pId === variables.projectId)
}

export const projectWorkspaceUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_UPDATED),
    (payload, variables) => payload.workspaceUpdated.pId === variables.projectId)
}

export const projectWorkspaceDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_DELETED),
    (payload, variables) => payload.workspaceDeleted.pId === variables.projectId)
}
