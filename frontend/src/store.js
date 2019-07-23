import React, { createContext, useContext, useReducer } from 'react'

export const LoginStateContext = createContext(false)
export const MessageStateContext = createContext('')


export const LoginStateProvider = ({ reducer, initialState, children }) => (
  <LoginStateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </LoginStateContext.Provider>
)

export const MessagingStateProvider = ({ reducer, initialState, children }) => (
  <MessageStateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </MessageStateContext.Provider>
)

export const useMessageStateValue = () => useContext(MessageStateContext)
export const useLoginStateValue = () => useContext(LoginStateContext)
