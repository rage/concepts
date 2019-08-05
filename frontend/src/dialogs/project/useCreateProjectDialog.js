import { useMutation } from 'react-apollo-hooks'

import { CREATE_PROJECT } from '../../graphql/Mutation'
import { PROJECTS_FOR_USER } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'

const useCreateProjectDialog = () => {
  const { openDialog } = useDialog()
  const createProject = useMutation(CREATE_PROJECT, {
    refetchQueries: [
      { query: PROJECTS_FOR_USER }
    ]
  })

  return name => openDialog({
    mutation: createProject,
    requiredVariables: {},
    actionText: 'Create',
    fields: [{
      name: 'name',
      defaultValue: name
    }],
    title: 'Create project',
    content: [
      'Projects are used to manage the creation of workspaces.'
    ]
  })
}

export default useCreateProjectDialog
