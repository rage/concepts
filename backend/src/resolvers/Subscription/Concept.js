const { pubsub } = require('./config')

const CONCEPT_CREATED = 'CONCEPT_CREATED'
const CONCEPT_UPDATED = 'CONCEPT_UPDATED'
const CONCEPT_DELETED = 'CONCEPT_DELETED'

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