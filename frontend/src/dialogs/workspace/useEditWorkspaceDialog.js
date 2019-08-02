import { useMutation } from 'react-apollo-hooks'

import { UPDATE_WORKSPACE } from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER, WORKSPACE_BY_ID } from '../../graphql/Query'
import { useDialog } from '../Dialog'

const useEditWorkspaceDialog = workspaceId => {
  const { openDialog } = useDialog()
  const updateWorkspace = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: [
      { query: WORKSPACES_FOR_USER },
      { query: WORKSPACE_BY_ID, variables: { id: workspaceId } }
    ]
  })

  return name => openDialog({
    mutation: updateWorkspace,
    requiredVariables: { id: workspaceId },
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
