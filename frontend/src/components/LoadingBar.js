import React, { createContext, useContext, useRef, useEffect } from 'react'

export const LoadingContext = createContext(null)

export const LoadingProvider = ({ children }) => {
  const provider = useRef(null)
  const startLoading = (...args) => provider.current.startLoading(...args)
  const stopLoading = (...args) => provider.current.stopLoading(...args)
  const setProvider = newProvider => provider.current = newProvider
  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, setProvider }}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoadingBar = () => useContext(LoadingContext)

const LoadingBar = ({ id, componentRef, children = null }) => {
  const { startLoading, stopLoading } = useLoadingBar()

  if (componentRef) {
    componentRef.current.stopLoading = stopLoading
  }

  useEffect(() => {
    startLoading(id)
    return () => stopLoading(id)
  }, [])

  return children
}

export default LoadingBar
