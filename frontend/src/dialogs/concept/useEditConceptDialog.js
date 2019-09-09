import { useMutation } from '@apollo/react-hooks'

import { UPDATE_CONCEPT } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'
import TaxonomyTags from './TaxonomyTags'
import tagSelectProps from './tagSelectUtils'

const useEditConceptDialog = isStaff => {
  const { openDialog } = useDialog()

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate
  })

  return (conceptId, name, description, tags, official) => openDialog({
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
    },
    {
      name: 'official',
      type: 'checkbox',
      defaultValue: official,
      hidden: !isStaff
    },
    {
      type: 'select',
      name: 'tags',
      label: 'Select tags',
      ...tagSelectProps(tags),
      values: Object.values(TaxonomyTags)
    }]
  })
}

export default useEditConceptDialog
