import { useMutation } from 'react-apollo-hooks'

import { CREATE_WORKSPACE } from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'
import WorkspaceCreationActions from './WorkspaceCreationActions'

const useCreateWorkspaceDialog = () => {
  const { openDialog } = useDialog()
  const createWorkspace = useMutation(CREATE_WORKSPACE, {
    refetchQueries: [
      { query: WORKSPACES_FOR_USER }
    ]
  })

  return () => openDialog({
    mutation: createWorkspace,
    type: 'Workspace',
    actionText: 'Create',
    fields: [{
      name: 'name',
      required: true
    }],
    title: 'Create workspace',
    content: [
      'Workspaces work as a sandbox for you to create and connect concepts with each other.'
    ],
    CustomActions: WorkspaceCreationActions
  })
}

export default useCreateWorkspaceDialog
