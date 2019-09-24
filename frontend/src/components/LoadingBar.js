import React, { createContext, useContext, useRef, useEffect } from 'react'

export const LoadingContext = createContext(null)

export const LoadingProvider = ({ children }) => {
  const provider = useRef(null)
  const value = {
    startLoading: (...args) => provider.current.startLoading(...args),
    stopLoading: (...args) => provider.current.stopLoading(...args),
    setProvider: newProvider => provider.current = newProvider
  }
  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoadingBar = () => useContext(LoadingContext)

const LoadingBar = ({ id, componentRef, children = null }) => {
  const { startLoading, stopLoading } = useLoadingBar()

  if (componentRef) {
    componentRef.current = { stopLoading }
  }

  useEffect(() => {
    startLoading(id)
    return () => stopLoading(id)
  }, [id, startLoading, stopLoading])

  return children
}

export default LoadingBar
