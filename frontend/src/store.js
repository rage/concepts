import React, { createContext, useContext, useReducer } from 'react'

export const LoginStateContext = createContext(false)

export const LoginStateProvider = ({ reducer, initialState, children }) => (
  <LoginStateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </LoginStateContext.Provider>
)

export const useLoginStateValue = () => useContext(LoginStateContext)