import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { CssBaseline } from '@material-ui/core'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'

import App from './App'
import client from './apollo/apolloClient'
import { isSignedIn } from './lib/authentication'
import { LoginStateProvider, MessagingStateProvider } from './store'
import FocusOverlay from './components/FocusOverlay'
import InfoBox from './components/InfoBox'
import InfoSnackbar from './components/InfoSnackbar'
import { DialogProvider } from './dialogs'
import { LoadingProvider } from './components/LoadingBar'

import './index.css'

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

const messageReducer = (state, action) => {
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
    user = JSON.parse(window.localStorage.currentUser).user
    return user
  } catch (error) {
    return {}
  }
}

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <MessagingStateProvider
          initialState={{ error: '', notification: '' }}
          reducer={messageReducer}
        >
          <LoginStateProvider
            initialState={{ loggedIn: isSignedIn(), user: getLoggedInUser() }}
            reducer={loginReducer}
          >
            <CssBaseline />
            <InfoSnackbar />
            <DialogProvider>
              <FocusOverlay>
                <InfoBox>
                  <LoadingProvider>
                    <App />
                  </LoadingProvider>
                </InfoBox>
              </FocusOverlay>
            </DialogProvider>
          </LoginStateProvider>
        </MessagingStateProvider>
      </MuiPickersUtilsProvider>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)
