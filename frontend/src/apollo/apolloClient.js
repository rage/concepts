import { createRef } from 'react'
import ApolloClient, { InMemoryCache } from 'apollo-boost'

let requestsInFlight = 0

export const savingIndicator = createRef()

const client = new ApolloClient({
  uri: '/graphql',
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
