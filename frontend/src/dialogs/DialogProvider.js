import React, { useRef, createContext, useContext, useEffect } from 'react'
import { withRouter } from 'react-router-dom'

import Dialog from './Dialog'

export const DialogContext = createContext({})
export const useDialog = () => useContext(DialogContext)

export const DialogProvider = withRouter(({ children, history }) => {
  const dialogContextValue = useRef({})

  const dialogContextProxy = {
    openDialog: (...args) => dialogContextValue.current.openDialog(...args),
    updateDialog: (...args) => dialogContextValue.current.updateDialog(...args),
    closeDialog: (...args) => dialogContextValue.current.closeDialog(...args),
    setSubmitDisabled: (...args) => dialogContextValue.current.setSubmitDisabled(...args)
  }

  useEffect(() => history.listen(() => {
    if (dialogContextValue.current.closeDialog) {
      dialogContextValue.current.closeDialog()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  return <>
    <DialogContext.Provider value={dialogContextProxy}>
      {children}
    </DialogContext.Provider>
    <Dialog contextRef={dialogContextValue} />
  </>
})
