import React from 'react'
import ReactDOM from 'react-dom'
import AltApp from './AltApp'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo-hooks'

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql'
})

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <AltApp />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)