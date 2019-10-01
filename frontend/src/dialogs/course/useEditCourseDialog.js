import { useMutation, useQuery } from 'react-apollo-hooks'

import { UPDATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'
import tagSelectProps, { backendToSelect } from '../tagSelectUtils'
import { WORKSPACE_BY_ID } from '../../graphql/Query'

const useEditCourseDialog = (workspaceId, isStaff) => {
  const { openDialog } = useDialog()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })

  return (courseId, name, official, frozen, tags) => openDialog({
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
    },
    {
      name: 'official',
      type: 'checkbox',
      defaultValue: official,
      hidden: !isStaff
    },
    {
      name: 'frozen',
      type: 'checkbox',
      defaultValue: frozen,
      hidden: !isStaff
    },
    {
      type: 'select',
      name: 'tags',
      label: 'Themes...',
      ...tagSelectProps(tags),
      values: backendToSelect(workspaceQuery.data.workspaceById.courseTags)
    }]
  })
}

export default useEditCourseDialog
