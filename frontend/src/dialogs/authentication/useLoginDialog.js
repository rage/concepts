import { useDialog } from '../DialogProvider'

const useLoginDialog = () => {
  const { openDialog } = useDialog()

  return () => openDialog({
    mutation: null,
    type: 'Concept',
    actionText: 'Log in',
    title: 'Log in with mooc.fi',
    rejectPromise: true,
    fields: [{
      name: 'email',
      required: true
    }, {
      name: 'password',
      textfieldType: 'password',
      required: true
    }]
  })
}

export default useLoginDialog
