const { pubsub } = require('./config')
const { CONCEPT_CREATED, CONCEPT_UPDATED, CONCEPT_DELETED } = require('./config/channels')

const ConceptSubscriptions = {
  conceptCreated: {
    subscribe: () => pubsub.asyncIterator(CONCEPT_CREATED)
  },
  conceptUpdated: {
    subscribe: () => pubsub.asyncIterator(CONCEPT_UPDATED)
  },
  conceptDeleted: {
    subscribe: () => pubsub.asyncIterator(CONCEPT_DELETED)
  }
}

module.exports = ConceptSubscriptions