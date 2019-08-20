import { useMutation } from 'react-apollo-hooks'

import { UPDATE_CONCEPT } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'
import TaxonomyTags from './TaxonomyTags'
const useEditConceptDialog = () => {
  const { openDialog } = useDialog()

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate
  })

  return (conceptId, name, description, tags) => openDialog({
    mutation: updateConcept,
    type: 'Concept',
    requiredVariables: {
      id: conceptId,
      official: false
    },
    actionText: 'Save',
    title: 'Edit concept',
    fields: [{
      type: 'textfield',
      name: 'name',
      required: true,
      defaultValue: name
    }, {
      type: 'textfield',
      name: 'description',
      multiline: true,
      defaultValue: description
    }, {
      type: 'select',
      name: 'tags',
      label: "Select Bloom's tags",
      isList: true,
      defaultValue: tags.length > 0 ? tags[0].name : '',
      values: TaxonomyTags
    }]
  })
}

export default useEditConceptDialog
