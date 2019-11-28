import { makeSubscriptionResolvers } from './subscriptionUtil'

export const { courseCreated, courseUpdated, courseDeleted } = makeSubscriptionResolvers(
  'course', ['create', 'update', 'delete'])
