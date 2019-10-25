const { pubsub } = require('./config')
const { CONCEPT_LINK_CREATED, CONCEPT_LINK_DELETED } = require('./config/channels')
const { withFilter } = require('graphql-subscriptions')

const ConceptLinkSubscriptions = {
  conceptLinkCreated: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(CONCEPT_LINK_CREATED),
      (payload, variables) => {
        return payload.conceptLinkCreated.workspaceId === variables.workspaceId
      })
  },
  conceptLinkDeleted: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(CONCEPT_LINK_DELETED),
      (payload, variables) => {
        return payload.conceptLinkDeleted.workspaceId === variables.workspaceId
      })
  }
}

module.exports = ConceptLinkSubscriptions