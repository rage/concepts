import { useMutation } from 'react-apollo-hooks'

import TagSelector from './TagSelector'
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
      name: 'name',
      required: true,
      defaultValue: name
    }, {
      name: 'description',
      multiline: true,
      defaultValue: description
    }],
    specialFields: [
      TagSelector
    ]
  })
}

export default useEditConceptDialog
