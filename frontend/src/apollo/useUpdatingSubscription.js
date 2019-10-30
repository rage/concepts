import { useSubscription } from 'react-apollo-hooks'

import client from './apolloClient'
import cache from './update'
import * as subscriptions from '../graphql/Subscription'

export const useManyUpdatingSubscriptions = (namespaces, actions, args) => {
  if (!Array.isArray(namespaces)) {
    namespaces = [namespaces]
  }
  for (const namespace of namespaces) {
    for (const action of actions) {
      useUpdatingSubscription(namespace, action, args)
    }
  }
}

export const useUpdatingSubscription = (namespace, action, args) => {
  const subscriptionName = `${namespace.toUpperCase()}_${action.toUpperCase()}D_SUBSCRIPTION`
  // eslint-disable-next-line import/namespace
  const subscription = subscriptions[subscriptionName]
  const subscriptionDataFieldName = `${namespace.toLowerCase()}${action.toTitleCase()}d`
  const cacheDataFieldName = `${action.toLowerCase()}${namespace.toTitleCase()}`
  let cacheUpdate = args.update
  if (!cacheUpdate) {
    cacheUpdate = cache[`${cacheDataFieldName}Update`]
    if (args.updateParams !== null) {
      cacheUpdate = cacheUpdate(...args.updateParams || Object.values(args.variables))
    }
  }
  useSubscription(subscription, {
    variables: args.variables,
    onSubscriptionData: ({ subscriptionData }) => {
      const res = {
        data: {
          [cacheDataFieldName]: {
            ...subscriptionData.data[subscriptionDataFieldName]
          }
        }
      }
      cacheUpdate(client, res)
    }
  })
}
