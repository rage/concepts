import ApolloClient, { InMemoryCache } from 'apollo-boost'
import { split } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import { savingIndicator } from '../components/NavBar'

let requestsInFlight = 0

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:8080/graphql',
  options: { reconnect: true }
})

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql'
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    dataIdFromObject: o => o.id
  }),
  request: (operation) => {
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
  },
  fetch: async (resource, init) => {
    const isMutation = init.headers['X-Concepts-IsMutation'] === 'true'
    if (isMutation) {
      if (requestsInFlight === 0 && savingIndicator.current) {
        savingIndicator.current.innerText = 'Saving...'
      }
      requestsInFlight++
      const result = await fetch(resource, init)
      requestsInFlight--
      if (requestsInFlight === 0 && savingIndicator.current) {
        // eslint-disable-next-line require-atomic-updates
        savingIndicator.current.innerText = 'All changes saved.'
      }
      return result
    } else {
      return fetch(resource, init)
    }
  }
})

export default client
