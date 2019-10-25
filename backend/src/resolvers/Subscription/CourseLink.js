const { pubsub } = require('./config')
const { COURSE_LINK_CREATED, COURSE_LINK_UPDATED, COURSE_LINK_DELETED } = require('./config/channels')
const { withFilter } = require('graphql-subscriptions')

const CourseLinkSubscriptions = {
  courseLinkCreated: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(COURSE_LINK_CREATED),
      (payload, variables) => {
        return payload.courseLinkCreated.workspaceId === variables.workspaceId
      })
  },
  courseLinkUpdated: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(COURSE_LINK_UPDATED),
      (payload, variables) => {
        return payload.courseLinkUpdated.workspaceId === variables.workspaceId
      })
  },
  courseLinkDeleted: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(COURSE_LINK_DELETED),
      (payload, variables) => {
        return payload.courseLinkDeleted.workspaceId === variables.workspaceId
      })
  }
}

module.exports  = CourseLinkSubscriptions