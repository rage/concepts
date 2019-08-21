import { useMutation } from 'react-apollo-hooks'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { useDialog } from '../DialogProvider'
import cache from '../../apollo/update'
import TaxonomyTags from './TaxonomyTags'
const useCreateConceptDialog = workspaceId => {
  const { openDialog } = useDialog()

  const createConcept = useMutation(CREATE_CONCEPT, {
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
    }, {
      type: 'select',
      nullable: true,
      name: 'tags',
      label: "Select Bloom's tags",
      values: TaxonomyTags
    }]
  })
}

export default useCreateConceptDialog
