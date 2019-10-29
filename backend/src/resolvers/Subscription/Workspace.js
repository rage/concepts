const { withFilter } = require('graphql-subscriptions')
const { pubsub } = require('./config')
const { 
  WORKSPACE_CREATED, 
  WORKSPACE_UPDATED, 
  WORKSPACE_DELETED 
} = require('./config/channels')

const WorkspaceSubscriptions = {
  workspaceCreated: {
    subscribe: withFilter(() => pubsub.asyncIterator(WORKSPACE_CREATED),
    (payload, variables) => payload.workspaceCreated.projectId === variables.projectId)
  },
  workspaceUpdated: {
    subscribe: () => pubsub.asyncIterator(WORKSPACE_UPDATED)
  },
  workspaceDeleted: {
    subscribe: () => pubsub.asyncIterator(WORKSPACE_DELETED)
  }
}

module.exports = WorkspaceSubscriptions
