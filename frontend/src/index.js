import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import client from './apolloClient'
import { ApolloProvider } from 'react-apollo-hooks'
import { isSignedIn } from './lib/authentication'
import { LoginStateProvider } from './store'

const reducer = (state, action) => {
  switch (action.type) {
    case 'login':
      return {
        ...state,
        loggedIn: true
      }
    case 'logout':
      return {
        ...state,
        loggedIn: false
      }
    default:
      return state
  }
}

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <LoginStateProvider initialState={{ loggedIn: isSignedIn() }} reducer={reducer}>
        <App />
      </LoginStateProvider>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)