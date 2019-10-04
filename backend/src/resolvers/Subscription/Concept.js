const ConceptSubscriptions = {
  conceptCreated: {
    subscribe: (parent, args, { pubsub }) => {
      return pubsub.asyncIterator(['CONCEPT_CREATED'])
    }
  }
}

module.exports = ConceptSubscriptions