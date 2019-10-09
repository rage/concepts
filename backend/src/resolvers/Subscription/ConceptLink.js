const { pubsub } = require('./config')
const { CONCEPT_LINK_CREATED, CONCEPT_LINK_DELETED } = require('./config/channels')

const ConceptLinkSubscriptions = {
  conceptLinkCreated: {
    subscribe: () => pubsub.asyncIterator(CONCEPT_LINK_CREATED)
  },
  conceptLinkDeleted: {
    subscribe: () => pubsub.asyncIterator(CONCEPT_LINK_DELETED)
  }
}

module.exports = ConceptLinkSubscriptions