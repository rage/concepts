import { useMutation } from '@apollo/react-hooks'

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

  return () => openDialog({
    mutation: createProject,
    type: 'Project',
    requiredVariables: {},
    actionText: 'Create',
    fields: [{
      name: 'name',
      required: true
    }],
    title: 'Create project',
    content: [
      'Projects are used to manage the creation of workspaces.'
    ]
  })
}

export default useCreateProjectDialog
