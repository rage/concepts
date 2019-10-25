const { pubsub } = require('./config')
const { CONCEPT_CREATED, CONCEPT_UPDATED, CONCEPT_DELETED } = require('./config/channels')
const { withFilter } = require('graphql-subscriptions')

const ConceptSubscriptions = {
  conceptCreated: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(CONCEPT_CREATED),
      (payload, variables) => {
        return payload.conceptCreated.workspaceId === variables.workspaceId
      })
  },
  conceptUpdated: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(CONCEPT_UPDATED),
      (payload, variables) => {
        return payload.conceptUpdated.workspaceId === variables.workspaceId
      })
  },
  conceptDeleted: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(CONCEPT_DELETED),
      (payload, variables) => {
        return payload.conceptDeleted.workspaceId === variables.workspaceId
      })
  }
}

module.exports = ConceptSubscriptions