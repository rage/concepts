import { withFilter } from 'graphql-subscriptions'

import { canViewWorkspace } from '../../util/accessControl'
import pubsub from './pubsub'
import * as channels from './channels'

export const makeSubscriptionResolver = (
  type,
  payloadField = 'workspaceId',
  variableName = 'workspaceId',
  permissionChecker = canViewWorkspace
) => {
  // eslint-disable-next-line import/namespace
  const channel = channels[type.toUpperSnakeCase()]
  const payloadObjectName = type.toCamelCase()
  return {
    subscribe: withFilter(() => pubsub.asyncIterator(channel),
      async (payload, variables, ctx) => await permissionChecker(ctx, variables[variableName])
        && payload[payloadObjectName][payloadField] === variables[variableName]
    )
  }
}

export const makeSubscriptionResolvers = (
  type, actions,
  payloadField = 'workspaceId',
  variableName = 'workspaceId',
  permissionChecker = canViewWorkspace
) => Object.fromEntries(actions.map(action => {
  const mergedName = `${type} ${action}d`
  return [
    mergedName.toCamelCase(),
    makeSubscriptionResolver(mergedName, payloadField, variableName, permissionChecker)
  ]
}))
