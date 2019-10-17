import React, { createContext, useContext, useReducer } from 'react'

export const MessageStateContext = createContext('')

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
