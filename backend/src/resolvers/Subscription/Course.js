const { pubsub } = require('./config')

const COURSE_CREATED = 'COURSE_CREATED'
const COURSE_UPDATED = 'COURSE_UPDATED'
const COURSE_DELETED = 'COURSE_DELETED'

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