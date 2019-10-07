const { pubsub } = require('./config')

const COURSE_LINK_CREATED = 'COURSE_LINK_CREATED'
const COURSE_LINK_UPDATED = 'COURSE_LINK_UPDATED'
const COURSE_LINK_DELETED = 'COURSE_LINK_DELETED'

const CourseLinkSubscriptions = {
  courseLinkCreated: {
    subscribe: () => pubsub.asyncIterator(COURSE_LINK_CREATED)
  },
  courseLinkUpdated: {
    subscribe: () => pubsub.asyncIterator(COURSE_LINK_UPDATED)
  },
  courseLinkDeleted: {
    subscribe: () => pubsub.asyncIterator(COURSE_LINK_DELETED)
  }
}

module.exports  = CourseLinkSubscriptions