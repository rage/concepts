import { useMutation } from 'react-apollo-hooks'

import { CREATE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'
import { PROJECT_BY_ID } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'

const useCreateTemplateDialog = projectId => {
  const { openDialog } = useDialog()
  const createTemplateWorkspace = useMutation(CREATE_TEMPLATE_WORKSPACE, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  return name => openDialog({
    mutation: createTemplateWorkspace,
    requiredVariables: { projectId },
    actionText: 'Create',
    fields: [{
      name: 'name',
      defaultValue: name
    }],
    title: 'Create template workspace',
    content: [
      `
Templates are workspaces, which will be cloned by users for their own mapping. 
User workspaces can later be merged.`
    ]
  })
}

export default useCreateTemplateDialog
