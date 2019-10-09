const { pubsub } = require('./config')
const { COURSE_LINK_CREATED, COURSE_LINK_UPDATED, COURSE_LINK_DELETED } = require('./config/channels')

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