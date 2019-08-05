import { useMutation } from 'react-apollo-hooks'

import { UPDATE_WORKSPACE } from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER, WORKSPACE_BY_ID } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'

const useEditWorkspaceDialog = refetchWorkspaceId => {
  const { openDialog } = useDialog()
  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: refetchWorkspaceId
      ? [{ query: WORKSPACE_BY_ID, variables: { id: refetchWorkspaceId } }]
      : [{ query: WORKSPACES_FOR_USER }]
  })

  return (id, name) => openDialog({
    mutation: updateWorkspace,
    type: 'Workspace',
    requiredVariables: { id },
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
