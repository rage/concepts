const { pubsub } = require('./config')
const { WORKSPACE_CREATED, WORKSPACE_UPDATED, WORKSPACE_DELETED } = require('./config/channels')

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
