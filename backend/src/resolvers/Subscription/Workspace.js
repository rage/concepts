const { pubsub } = require('./config')

const WORKSPACE_CREATED = 'WORKSPACE_CREATED'
const WORKSPACE_UPDATED = 'WORKSPACE_UPDATED'
const WORKSPACE_DELETED = 'WORKSPACE_DELETED'

const WorkspaceSubscriptions = {
  workspaceCreated: {
    subscribe: () => pubsub.asyncIterator(WORKSPACE_CREATED)
  },
  workspaceUpdated: {
    subscribe: () => pubsub.asyncIterator(WORKSPACE_UPDATED)
  },
  workspaceDeleted: {
    subscribe: () => pubsub.asyncIterator(WORKSPACE_DELETED)
  }
}

module.exports = WorkspaceSubscriptions