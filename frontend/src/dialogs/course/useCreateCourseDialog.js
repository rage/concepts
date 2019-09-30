import { useMutation, useQuery } from 'react-apollo-hooks'

import { CREATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'
import tagSelectProps, { backendToSelect } from '../tagSelectUtils'
import { WORKSPACE_BY_ID } from '../../graphql/Query'

const useCreateCourseDialog = (workspaceId, isStaff) => {
  const { openDialog } = useDialog()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

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
      hidden: !isStaff
    },
    {
      name: 'frozen',
      type: 'checkbox',
      hidden: !isStaff
    }, {
      name: 'tags',
      label: 'Themes...',
      ...tagSelectProps(),
      values: backendToSelect(workspaceQuery.data.workspaceById.courseTags)
    }]
  })
}

export default useCreateCourseDialog
