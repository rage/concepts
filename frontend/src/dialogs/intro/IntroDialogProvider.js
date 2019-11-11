import React, { useRef, createContext, useContext, useEffect } from 'react'

import IntroDialog from './IntroDialog'
import useRouter from '../../lib/useRouter'

export const IntroDialogContext = createContext({})
export const useIntroDialog = () => useContext(IntroDialogContext)

export const IntroDialogProvider = ({ children }) => {
  const { history } = useRouter()
  const introDialogContextValue = useRef({})

  const introDialogContextProxy = {
    openDialog: (...args) => introDialogContextValue.current.openDialog(...args),
    updateDialog: (...args) => introDialogContextValue.current.updateDialog(...args),
    closeDialog: (...args) => introDialogContextValue.current.closeDialog(...args)
  }

  useEffect(() =>
    history.listen(() => introDialogContextValue.current.closeDialog?.()),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  return <>
    <IntroDialogContext.Provider value={introDialogContextProxy}>
      {children}
    </IntroDialogContext.Provider>
    <IntroDialog contextRef={introDialogContextValue} />
  </>
}
