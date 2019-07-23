import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import client from './apollo/apolloClient'
import { ApolloProvider } from 'react-apollo-hooks'
import { isSignedIn } from './lib/authentication'
import { LoginStateProvider, MessagingStateProvider } from './store'
import FocusOverlay from './components/common/FocusOverlay'
import InfoBox from './components/common/InfoBox'

const loginReducer = (state, action) => {
  switch (action.type) {
  case 'login':
    return {
      ...state,
      loggedIn: true,
      user: action.data
    }
  case 'logout':
    return {
      ...state,
      loggedIn: false,
      user: {}
    }
  case 'setUserGuideProgress': {

    return {
      ...state,
      user: {
        ...state.user,
        guideProgress: action.data.guideProgress
      }
    }
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
  case 'setNotification':
    return {
      ...state,
      notification: action.data
    }
  case 'clearNotification':
    return {
      ...state,
      notification: ''
    }
  default:
    return state
  }
}

const getLoggedInUser = () => {
  let user
  try {
    user = JSON.parse(localStorage.getItem('current_user')).user
    return user
  } catch (error) {
    return {}
  }
}

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <MessagingStateProvider initialState={{ error: '', notification: '' }} reducer={errorReducer}>
        <LoginStateProvider
          initialState={{ loggedIn: isSignedIn(), user: getLoggedInUser() }}
          reducer={loginReducer}
        >
          <FocusOverlay>
            <InfoBox>
              <App />
            </InfoBox>
          </FocusOverlay>
        </LoginStateProvider>
      </MessagingStateProvider>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)
