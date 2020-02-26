import { useMutation } from '@apollo/react-hooks'

import { UPDATE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'
import { PROJECT_BY_ID } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'

const useEditTemplateDialog = projectId => {
  const { openDialog } = useDialog()
  const [updateTemplateWorkspace] = useMutation(UPDATE_TEMPLATE_WORKSPACE, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  return (workspaceId, name) => openDialog({
    mutation: updateTemplateWorkspace,
    type: 'Template',
    requiredVariables: { id: workspaceId },
    actionText: 'Save',
    fields: [{
      name: 'name',
      defaultValue: name,
      required: true
    }],
    title: 'Edit template workspace',
    content: [
      `
Templates are workspaces, which will be cloned by users for their own mapping. 
User workspaces can later be merged.`
    ]
  })
}

export default useEditTemplateDialog
