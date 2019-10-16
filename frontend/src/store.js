import React, { createContext, useContext, useReducer } from 'react'

import { Role } from './lib/permissions'

export const LoginStateContext = createContext(false)
export const MessageStateContext = createContext('')

const loginReducers = {
  login: (state, { data: user, authType: type, displayname }) => ({
    ...state,
    loggedIn: true,
    type,
    displayname,
    user: { ...user, role: Role.fromString(user.role) }
  }),
  logout: state => ({ ...state, loggedIn: false, displayname: null, type: null, user: {} })
}

const loginReducer = (state, action) => loginReducers[action.type](state, action)

let userData
try {
  userData = JSON.parse(window.localStorage.currentUser)
  userData.user.role = Role.fromString(userData.user.role)
} catch (error) {
  userData = {}
}
userData.loggedIn = Boolean(userData.user)

export const LoginStateProvider = ({ children }) => (
  <LoginStateContext.Provider value={useReducer(loginReducer, userData)}>
    {children}
  </LoginStateContext.Provider>
)

const messageReducers = {
  setError: (state, { data }) => ({ ...state, error: data }),
  clearError: state => ({ ...state, error: '' }),
  setNotification: (state, { data }) => ({ ...state, notification: data }),
  clearNotification: state => ({ ...state, notification: '' })
}

const messageReducer = (state, action) => messageReducers[action.type](state, action)

export const MessagingStateProvider = ({ children }) => (
  <MessageStateContext.Provider value={useReducer(messageReducer, { error: '', notification: '' })}>
    {children}
  </MessageStateContext.Provider>
)

export const useMessageStateValue = () => useContext(MessageStateContext)
export const useLoginStateValue = () => useContext(LoginStateContext)
