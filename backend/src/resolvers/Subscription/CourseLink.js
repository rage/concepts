const { withFilter } = require('graphql-subscriptions')

const { pubsub } = require('./config')
const {
  COURSE_LINK_CREATED,
  COURSE_LINK_UPDATED,
  COURSE_LINK_DELETED
} = require('./config/channels')

const CourseLinkSubscriptions = {
  courseLinkCreated: {
    subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_CREATED),
      (payload, variables) => payload.courseLinkCreated.workspaceId === variables.workspaceId)
  },
  courseLinkUpdated: {
    subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_UPDATED),
      (payload, variables) => payload.courseLinkUpdated.workspaceId === variables.workspaceId)
  },
  courseLinkDeleted: {
    subscribe: withFilter(() => pubsub.asyncIterator(COURSE_LINK_DELETED),
      (payload, variables) => payload.courseLinkDeleted.workspaceId === variables.workspaceId)
  }
}

module.exports = CourseLinkSubscriptions
