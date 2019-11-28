import { makeSubscriptionResolvers } from './subscriptionUtil'

export const { objectiveCreated, objectiveUpdated, objectiveDeleted } = makeSubscriptionResolvers(
  'objective', ['create', 'update', 'delete'])
