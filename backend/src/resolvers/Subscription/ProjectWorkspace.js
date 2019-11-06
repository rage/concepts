import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './config'
import {
  PROJECT_WORKSPACE_CREATED, PROJECT_WORKSPACE_UPDATED, PROJECT_WORKSPACE_DELETED
} from './config/channels'

export const projectWorkspaceCreated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_CREATED),
    (payload, variables) => payload.projectWorkspaceCreated.pId === variables.projectId)
}

export const projectWorkspaceUpdated = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_UPDATED),
    (payload, variables) => payload.projectWorkspaceUpdated.pId === variables.projectId)
}

export const projectWorkspaceDeleted = {
  subscribe: withFilter(() => pubsub.asyncIterator(PROJECT_WORKSPACE_DELETED),
    (payload, variables) => payload.projectWorkspaceDeleted.pId === variables.projectId)
}
