import { useMutation } from '@apollo/react-hooks'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { useDialog } from '../DialogProvider'
import cache from '../../apollo/update'
import TaxonomyTags from './TaxonomyTags'
import tagSelectProps from './tagSelectUtils'

const useCreateConceptDialog = (workspaceId, isStaff) => {
  const { openDialog } = useDialog()

  const [createConcept] = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate
  })

  return courseId => openDialog({
    mutation: createConcept,
    type: 'Concept',
    requiredVariables: {
      workspaceId,
      courseId,
      official: false
    },
    actionText: 'Create',
    title: 'Add concept',
    fields: [{
      name: 'name',
      required: true
    }, {
      name: 'description',
      multiline: true
    },
    {
      name: 'official',
      type: 'checkbox',
      hidden: !isStaff
    },
    {
      type: 'select',
      name: 'tags',
      label: 'Select tags',
      ...tagSelectProps(),
      values: Object.values(TaxonomyTags)
    }]
  })
}

export default useCreateConceptDialog
