import { createRef } from 'react'
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { split, ApolloLink } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

let requestsInFlight = 0

const authenticationLink = new ApolloLink((operation, forward) => {
  const isMutation = Boolean(operation.query.definitions
    .find(def => def.operation === 'mutation'))

  operation.setContext({
    headers: {
      'X-Concepts-IsMutation': isMutation.toString()
    }
  })
  const rawData = window.localStorage.currentUser
  if (rawData) {
    let data
    try {
      data = JSON.parse(rawData)
    } catch (e) {
      window.localStorage.clear()
      console.error(e)
    }
    if (data.token) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${data.token}`,
          'X-Concepts-IsMutation': isMutation.toString()
        }
      })
    }
  }

  return forward(operation)
})

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:8080/graphql',
  options: {
    reconnect: true,
    connectionParams: {
      token: window.localStorage.currentUser ?
        `Bearer ${JSON.parse(window.localStorage.currentUser).token}` : ''
    }
  }
})

export const changeSubscriptionToken = token => {
  if (wsLink.subscriptionClient.connectionParams.token !== token) {
    wsLink.subscriptionClient.connectionParams.token = token
    wsLink.subscriptionClient.close()
    wsLink.subscriptionClient.connect()
  }
}

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
  credentials: 'include',
  fetch: async (uri, options) => {
    const isMutation = options.headers['X-Concepts-IsMutation'] === 'true'
    if (isMutation) {
      if (requestsInFlight === 0 && savingIndicator.current) {
        savingIndicator.current.innerText = 'Saving...'
      }
      requestsInFlight++
      const result = await fetch(uri, options)
      requestsInFlight--
      if (requestsInFlight === 0 && savingIndicator.current) {
        // eslint-disable-next-line require-atomic-updates
        savingIndicator.current.innerText = 'All changes saved.'
      }
      return result
    } else {
      return fetch(uri, options)
    }
  }
})

const linkSplit = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink
)
export const savingIndicator = createRef()

const link = authenticationLink.concat(linkSplit)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    dataIdFromObject: o => o.id
  })
})

export default client
