import React, { useRef, createContext, useContext, useEffect } from 'react'

import Dialog from './Dialog'
import useRouter from '../lib/useRouter'

export const DialogContext = createContext({})
export const useDialog = () => useContext(DialogContext)

export const DialogProvider = ({ children }) => {
  const { history } = useRouter()
  const dialogContextValue = useRef({})

  const dialogContextProxy = {
    openDialog: (...args) => dialogContextValue.current.openDialog(...args),
    updateDialog: (...args) => dialogContextValue.current.updateDialog(...args),
    closeDialog: (...args) => dialogContextValue.current.closeDialog(...args)
  }

  useEffect(() =>
    history.listen(() => dialogContextValue.current.closeDialog?.()),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  return <>
    <DialogContext.Provider value={dialogContextProxy}>
      {children}
    </DialogContext.Provider>
    <Dialog contextRef={dialogContextValue} />
  </>
}
