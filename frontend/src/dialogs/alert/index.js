import { useAlert } from './AlertProvider'
export { useAlert, AlertProvider } from './AlertProvider'

export const useConfirm = () => {
  const { open } = useAlert()
  return ({
    type = 'warning', confirm = 'OK', cancel = 'Cancel', title, message, ...args
  }) => open({
    type,
    confirm,
    cancel,
    title,
    message,
    ...args
  })
}
