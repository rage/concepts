import { useMutation } from 'react-apollo-hooks'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { useDialog } from '../DialogProvider'
import cache from '../../apollo/update'

const useCreateConceptDialog = workspaceId => {
  const { openDialog } = useDialog()

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: cache.createConcept
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
    }]
  })
}

export default useCreateConceptDialog
