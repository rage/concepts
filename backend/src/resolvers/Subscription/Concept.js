const { pubsub } = require('./config')

const ConceptSubscriptions = {
  conceptCreated: {
    subscribe: () => pubsub.asyncIterator('CONCEPT_CREATED')
  }
}

module.exports = ConceptSubscriptions