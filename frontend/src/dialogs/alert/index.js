import { useAlertDialog } from './AlertProvider'

export { AlertProvider } from './AlertProvider'

export const useAlert = () => {
  const { open } = useAlertDialog()
  return ({ type = 'info', confirm = 'OK', title, message, ...args }) =>
    open({ type, confirm, cancel: null, title, message, ...args })
}

export const useConfirm = () => {
  const { open } = useAlertDialog()
  return ({ type = 'warning', confirm = 'OK', cancel = 'Cancel', title, message, ...args }) =>
    open({ type, confirm, cancel, title, message, confirmColor: 'secondary', ...args })
}

export const useConfirmDelete = () => {
  const { open } = useAlertDialog()
  return (message, extra = {}) => open({
    type: 'warning',
    title: 'Confirm deletion',
    message,
    confirm: 'Yes, delete',
    confirmColor: 'secondary',
    cancel: 'No, cancel',
    ...extra
  })
}
