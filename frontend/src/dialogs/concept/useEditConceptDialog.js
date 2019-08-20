import { useMutation } from 'react-apollo-hooks'

import { UPDATE_CONCEPT } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'

const useEditConceptDialog = workspaceId => {
  const { openDialog } = useDialog()

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate
  })

  return (conceptId, name, description) => openDialog({
    mutation: updateConcept,
    type: 'Concept',
    requiredVariables: {
      id: conceptId,
      official: false
    },
    actionText: 'Save',
    title: 'Edit concept',
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
