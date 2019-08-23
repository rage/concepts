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
      name: 'name',
      required: true,
      defaultValue: name
    }, {
      name: 'description',
      multiline: true,
      defaultValue: description
    }, {
      type: 'select',
      name: 'bloomTag',
      label: "Select Bloom's tags",
      list: 'tags',
      omitEmpty: true,
      valueMutator: name => ({ name, type: 'bloom' }),
      defaultValue: (tags.find(tag => tag.type === 'bloom') || {}).name,
      values: TaxonomyTags
    }]
  })
}

export default useEditConceptDialog
