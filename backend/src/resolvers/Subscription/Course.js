const { pubsub } = require('./config')
const { COURSE_CREATED, COURSE_UPDATED, COURSE_DELETED } = require('./config/channels')
const { withFilter } = require('graphql-subscriptions')

const CourseSubscriptions = {
  courseCreated: {
    subscribe: withFilter(() => pubsub.asyncIterator(COURSE_CREATED),
      (payload, variables) => {
        return payload.courseCreated.workspaceId === variables.workspaceId
      })
  },
  courseUpdated: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(COURSE_UPDATED),
      (payload, variables) => {
        return payload.courseUpdated.workspaceId === variables.workspaceId
      })
  },
  courseDeleted: {
    subscribe: () => withFilter(() => pubsub.asyncIterator(COURSE_DELETED),
      (payload, variables) => {
        return payload.courseDeleted.workspaceId === variables.workspaceId
      })
  }
}

module.exports = CourseSubscriptions