import React, { createContext, useContext, useReducer } from 'react'

export const LoginStateContext = createContext(false)
export const ErrorStateContext = createContext('')


export const LoginStateProvider = ({ reducer, initialState, children }) => (
  <LoginStateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </LoginStateContext.Provider>
)

export const ErrorStateProvider = ({ reducer, initialState, children }) => (
  <ErrorStateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </ErrorStateContext.Provider>
)

export const useErrorStateValue = () => useContext(ErrorStateContext)
export const useLoginStateValue = () => useContext(LoginStateContext)