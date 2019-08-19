import { useMutation } from 'react-apollo-hooks'

import { UPDATE_CONCEPT } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'

const useEditConceptDialog = () => {
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
      type: 'text-field',
      name: 'name',
      required: true,
      defaultValue: name
    }, {
      type: 'text-field',
      name: 'description',
      multiline: true,
      defaultValue: description
    }, {
      type: 'select',
      name: 'bloomsTag',
      label: 'Select Bloom\'s tag',
      defaultValue: 'REMEMBER',
      values: [
        'REMEMBER',
        'UNDERSTAND',
        'APPLY',
        'ANALYZE',
        'EVALUATE',
        'CREATE'
      ]
    }]
  })
}

export default useEditConceptDialog
