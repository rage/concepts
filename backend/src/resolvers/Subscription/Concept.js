import { makeSubscriptionResolvers } from './subscriptionUtil'

export const { conceptCreated, conceptUpdated, conceptDeleted } = makeSubscriptionResolvers(
  'concept', ['create', 'update', 'delete'])
