import { makeSubscriptionResolvers } from './subscriptionUtil'

export const {
  courseLinkCreated, courseLinkUpdated, courseLinkDeleted
} = makeSubscriptionResolvers(
  'course link', ['create', 'update', 'delete'])
