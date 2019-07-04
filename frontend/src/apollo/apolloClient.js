import ApolloClient from 'apollo-boost'
import { InMemoryCache } from 'apollo-cache-inmemory'

let uri = '/graphql'

const client = new ApolloClient({
  uri,
  cache: new InMemoryCache(),
  request: async (operation) => {
    const rawData = await window.localStorage.getItem('current_user')
    if (rawData) {
      let data
      try {
        data = JSON.parse(rawData)
      } catch (e) {
        window.localStorage.clear()
        console.log(e)
      }
      if (data.token) {
        operation.setContext({
          headers: {
            authorization: `Bearer ${data.token}`
          }
        })
      }
    }
  }
})

export default client
