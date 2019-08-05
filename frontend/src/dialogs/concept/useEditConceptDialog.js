import { useMutation } from 'react-apollo-hooks'

import { UPDATE_CONCEPT } from '../../graphql/Mutation'
import { updateConceptUpdate } from '../../apollo/update'
import { useDialog } from '../DialogProvider'

const useEditConceptDialog = (activeCourseId, workspaceId) => {
  const { openDialog } = useDialog()

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: updateConceptUpdate(activeCourseId, workspaceId)
  })

  return (conceptId, name, description) => openDialog({
    mutation: updateConcept,
    requiredVariables: {
      id: conceptId,
      official: false
    },
    actionText: 'Add concept',
    title: 'Add concept',
    fields: [{
      name: 'name',
      required: true,
      defaultValue: name
    }, {
      name: 'description',
      multiline: true,
      defaultValue: description
    }]
  })
}

export default useEditConceptDialog
