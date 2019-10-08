const { pubsub } = require('./config')
const { COURSE_CREATED, COURSE_UPDATED, COURSE_DELETED } = require('./config/channels')

const CourseSubscriptions = {
  courseCreated: {
    subscribe: () => pubsub.asyncIterator(COURSE_CREATED)
  },
  courseUpdated: {
    subscribe: () => pubsub.asyncIterator(COURSE_UPDATED)
  },
  courseDeleted: {
    subscribe: () => pubsub.asyncIterator(COURSE_DELETED)
  }
}

module.exports = CourseSubscriptions