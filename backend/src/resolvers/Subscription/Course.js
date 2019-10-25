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
    subscribe: () => pubsub.asyncIterator(COURSE_UPDATED)
  },
  courseDeleted: {
    subscribe: () => pubsub.asyncIterator(COURSE_DELETED)
  }
}

module.exports = CourseSubscriptions