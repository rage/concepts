import React, { useRef, createContext, useContext, useEffect } from 'react'

import useRouter from '../../lib/useRouter'
import Alert from './Alert'

export const AlertContext = createContext({})
export const useAlert = () => useContext(AlertContext)

export const AlertProvider = ({ children }) => {
  const { history } = useRouter()
  const alertContextValue = useRef({})

  const alertContextProxy = {
    open: (...args) => alertContextValue.current.open(...args),
    resolve: (...args) => alertContextValue.current.resolve(...args),
    reject: (...args) => alertContextValue.current.reject(...args)
  }

  useEffect(() =>
    history.listen(() => alertContextValue.current.reject?.()),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  return <>
    <AlertContext.Provider value={alertContextProxy}>
      { children }
    </AlertContext.Provider>
    <Alert contextRef={alertContextValue} />
  </>
}
