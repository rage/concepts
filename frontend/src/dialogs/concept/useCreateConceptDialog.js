import { useMutation } from 'react-apollo-hooks'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_PREREQ_FRAGMENT } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'

const useCreateConceptDialog = workspaceId => {
  const { openDialog } = useDialog()

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: (store, response) => {
      const addedConcept = response.data.createConcept
      const course = store.readFragment({
        id: 'Course:' + addedConcept.courses[0].id,
        fragment: COURSE_PREREQ_FRAGMENT
      })
      store.writeFragment({
        id: 'Course:' + addedConcept.courses[0].id,
        fragment: COURSE_PREREQ_FRAGMENT,
        data: {
          concepts: course.concepts.concat(addedConcept)
        }
      })
    }
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
