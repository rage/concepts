import { useMutation } from 'react-apollo-hooks'

import { CREATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'

const useCreateCourseDialog = (workspaceId, isStaff) => {
  const { openDialog } = useDialog()

  const createCourse = useMutation(CREATE_COURSE, {
    update: cache.createCourseUpdate(workspaceId)
  })

  return () => openDialog({
    mutation: createCourse,
    type: 'Course',
    requiredVariables: {
      workspaceId,
      official: false
    },
    actionText: 'Create',
    title: 'Add course',
    content: [
      'Courses can be connected to other courses as prerequisites.'
    ],
    fields: [{
      name: 'name',
      required: true
    },
    {
      name: 'official',
      type: 'checkbox',
      defaultValue: false,
      hidden: !isStaff
    }]
  })
}

export default useCreateCourseDialog
