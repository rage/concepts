const { withFilter } = require('graphql-subscriptions')

const { pubsub } = require('./config')
const {
  CONCEPT_CREATED,
  CONCEPT_UPDATED,
  CONCEPT_DELETED
} = require('./config/channels')

const ConceptSubscriptions = {
  conceptCreated: {
    subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_CREATED),
      (payload, variables) => payload.conceptCreated.workspaceId === variables.workspaceId)
  },
  conceptUpdated: {
    subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_UPDATED),
      (payload, variables) => payload.conceptUpdated.workspaceId === variables.workspaceId)
  },
  conceptDeleted: {
    subscribe: withFilter(() => pubsub.asyncIterator(CONCEPT_DELETED),
      (payload, variables) => payload.conceptDeleted.workspaceId === variables.workspaceId)
  }
}

module.exports = ConceptSubscriptions
