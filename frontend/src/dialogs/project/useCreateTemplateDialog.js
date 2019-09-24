import { useMutation } from 'react-apollo-hooks'

import { CREATE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'
import { PROJECT_BY_ID } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'
import WorkspaceCreationActions from '../workspace/WorkspaceCreationActions'

const useCreateTemplateDialog = projectId => {
  const { openDialog } = useDialog()
  const createTemplateWorkspace = useMutation(CREATE_TEMPLATE_WORKSPACE, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  return () => openDialog({
    mutation: createTemplateWorkspace,
    type: 'Template',
    requiredVariables: { projectId },
    actionText: 'Create',
    fields: [{
      name: 'name',
      required: true
    }],
    title: 'Create template workspace',
    content: [
      `
Templates are workspaces, which will be cloned by users for their own mapping. 
User workspaces can later be merged.`
    ],
    CustomActions: WorkspaceCreationActions,
    customActionsProps: { projectId }
  })
}

export default useCreateTemplateDialog
