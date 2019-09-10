import { useMutation } from 'react-apollo-hooks'

import { UPDATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'
import { backendToSelect, selectToBackend } from '../tagSelectUtils'

const useEditCourseDialog = (workspaceId, isStaff) => {
  const { openDialog } = useDialog()

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })

  return (courseId, name, official, themes) => openDialog({
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
      type: 'select',
      name: 'tags',
      isMultiSelect: true,
      label: 'Themes...',
      menuIsOpen: false,
      valueMutator: selectToBackend,
      components: {
        DropdownIndicator: null
      },
      defaultValue: themes ? backendToSelect(themes) : [],
      values: themes
    }]
  })
}

export default useEditCourseDialog
