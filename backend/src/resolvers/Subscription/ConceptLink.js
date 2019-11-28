import { makeSubscriptionResolvers } from './subscriptionUtil'

export const { conceptLinkCreated, conceptLinkDeleted } = makeSubscriptionResolvers(
  'concept link', ['create', 'delete'])
