import { useMutation } from '@apollo/react-hooks'

import { UPDATE_PROJECT } from '../../graphql/Mutation'
import { PROJECTS_FOR_USER } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'

const useEditProjectDialog = () => {
  const { openDialog } = useDialog()
  const [updateProject] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [
      { query: PROJECTS_FOR_USER }
    ]
  })

  return (projectId, name) => openDialog({
    mutation: updateProject,
    type: 'Project',
    requiredVariables: { id: projectId },
    actionText: 'Save',
    fields: [{
      name: 'name',
      defaultValue: name,
      required: true
    }],
    title: 'Edit project',
    content: [
      'Projects are used to manage the creation of workspaces.'
    ]
  })
}

export default useEditProjectDialog
