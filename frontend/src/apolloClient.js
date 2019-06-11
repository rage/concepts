import ApolloClient from 'apollo-boost'
import { InMemoryCache } from 'apollo-cache-inmemory'

let uri = '/graphql'

const client = new ApolloClient({
  uri,
  cache: new InMemoryCache()
})

export default client