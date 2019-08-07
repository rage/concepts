import { useMutation } from 'react-apollo-hooks'

import { UPDATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'

const useEditCourseDialog = (workspaceId) => {
  const { openDialog } = useDialog()

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })

  return (courseId, name) => openDialog({
    mutation: updateCourse,
    type: 'Course',
    requiredVariables: {
      id: courseId,
      official: false
    },
    actionText: 'Save',
    title: 'Edit course',
    content: [
      'Courses can be connected to other courses as prerequisites.'
    ],
    fields: [{
      name: 'name',
      defaultValue: name,
      required: true
    }]
  })
}

export default useEditCourseDialog
