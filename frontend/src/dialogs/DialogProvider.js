import React, { useRef, createContext, useContext } from 'react'

import Dialog from './Dialog'

export const DialogContext = createContext({})
export const useDialog = () => useContext(DialogContext)

export const DialogProvider = ({ children }) => {
  const dialogContextValue = useRef({})

  const dialogContextProxy = {
    openDialog: (...args) => dialogContextValue.current.openDialog(...args),
    updateDialog: (...args) => dialogContextValue.current.updateDialog(...args),
    closeDialog: (...args) => dialogContextValue.current.closeDialog(...args),
    setSubmitDisabled: (...args) => dialogContextValue.current.setSubmitDisabled(...args)
  }

  return <>
    <DialogContext.Provider value={dialogContextProxy}>
      {children}
    </DialogContext.Provider>
    <Dialog contextRef={dialogContextValue} />
  </>
}
