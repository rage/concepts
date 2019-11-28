import { makeSubscriptionResolvers } from './subscriptionUtil'

export const { workspaceUpdated, workspaceDeleted } = makeSubscriptionResolvers(
  'workspace', ['update', 'delete'])
