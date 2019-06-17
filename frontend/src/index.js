import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import client from './apolloClient'
import { ApolloProvider } from 'react-apollo-hooks'
import { isSignedIn } from './lib/authentication'
import { LoginStateProvider, ErrorStateProvider } from './store'

const loginReducer = (state, action) => {
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

const errorReducer = (state, action) => {
  switch (action.type) {
    case 'setError':
      return {
        ...state,
        error: action.data
      }
    case 'clearError':
      return {
        ...state,
        error: ''
      }
    default:
      return state
  }
}

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <ErrorStateProvider initialState={{ error: '' }} reducer={errorReducer}>
        <LoginStateProvider initialState={{ loggedIn: isSignedIn() }} reducer={loginReducer}>
          <App />
        </LoginStateProvider>
      </ErrorStateProvider>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)