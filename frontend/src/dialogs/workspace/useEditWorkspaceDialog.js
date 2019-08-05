import { useMutation } from 'react-apollo-hooks'

import { UPDATE_WORKSPACE } from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER, WORKSPACE_BY_ID } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'

const useEditWorkspaceDialog = workspaceId => {
  const { openDialog } = useDialog()
  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: workspaceId
      ? [{ query: WORKSPACE_BY_ID, variables: { id: workspaceId } }]
      : [{ query: WORKSPACES_FOR_USER }]
  })

  return (name, providedWorkspaceId) => openDialog({
    mutation: updateWorkspace,
    requiredVariables: { id: (workspaceId || providedWorkspaceId) },
    actionText: 'Save',
    fields: [{
      name: 'name',
      defaultValue: name
    }],
    title: 'Edit workspace',
    content: [
      'Workspaces work as a sandbox for you to create and connect concepts with each other.'
    ]
  })
}

export default useEditWorkspaceDialog
