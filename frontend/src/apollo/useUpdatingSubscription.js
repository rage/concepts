import { useSubscription } from '@apollo/react-hooks'

import client from './apolloClient'
import cache from './update'
import * as subscriptions from '../graphql/Subscription'

export const useManyUpdatingSubscriptions = (namespaces, actions, args) => {
  if (!Array.isArray(namespaces)) {
    namespaces = [namespaces]
  }
  for (const namespace of namespaces) {
    for (const action of actions) {
      // We only pass hardcoded arrays to this method
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useUpdatingSubscription(namespace, action, args)
    }
  }
}

const warned = new Set()

export const useUpdatingSubscription = (namespace, action, args) => {
  const subName = `${namespace.toUpperSnakeCase()}_${action.toUpperSnakeCase()}D_SUBSCRIPTION`
  // eslint-disable-next-line import/namespace
  const subscription = subscriptions[subName]
  if (!subscription) {
    if (!warned.has(subName)) {
      warned.add(subName)
      console.warn(`Subscription ${subName} not found`)
    }
    return
  }
  const subscriptionDataFieldName = `${namespace.toCamelCase()}${action.toPascalCase()}d`
  const cacheDataFieldName = `${action.toCamelCase()}${namespace.toPascalCase()}`
  let cacheUpdate = args.update
  if (!cacheUpdate) {
    cacheUpdate = cache[`${cacheDataFieldName}Update`]
    if (args.updateParams !== null) {
      cacheUpdate = cacheUpdate(...args.updateParams || Object.values(args.variables))
    }
  }
  // The condition in the return earlier is also hardcoded
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSubscription(subscription, {
    variables: args.variables,
    onSubscriptionData: ({ subscriptionData }) => {
      const res = {
        data: {
          [cacheDataFieldName]: subscriptionData.data[subscriptionDataFieldName]
        }
      }
      cacheUpdate(client, res)
      if (args.postUpdate) {
        args.postUpdate()
      }
    }
  })
}
