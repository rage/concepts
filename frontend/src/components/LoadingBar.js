import React, { Component, createContext, useContext, useRef } from 'react'

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

class InnerLoadingBar extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.componentRef) {
      nextProps.componentRef.current = this
    }
  }

  componentWillMount() {
    this.props.startLoading(this.props.id)
  }

  componentWillUnmount() {
    this.props.stopLoading(this.props.id)
  }

  render() {
    return this.props.children || null
  }
}

const LoadingBar = props => {
  const { startLoading, stopLoading } = useLoadingBar()
  return <InnerLoadingBar {...props} startLoading={startLoading} stopLoading={stopLoading} />
}

export default LoadingBar
