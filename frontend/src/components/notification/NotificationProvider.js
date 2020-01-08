import React, { useRef, createContext, useContext, useEffect} from 'react'
import useRouter from '../../lib/useRouter'
import Notification from './Notification'

export const NotificationContext = createContext({})
export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({children}) => {
  const { history } = useRouter()
  const notificationContextValue = useRef({})

  const notificationContextProxy = {
    open: (...args) => notificationContextValue.current.open(...args),
    close: (...args) => notificationContextValue.current.close(...args)
  }

  useEffect(() =>
    history.listen(() => notificationContextValue.current.closeDialog?.()),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  return <>
    <NotificationContext.Provider value={notificationContextProxy}>
      { children }
    </NotificationContext.Provider>
    <Notification contextRef={notificationContextValue} />
  </>
}