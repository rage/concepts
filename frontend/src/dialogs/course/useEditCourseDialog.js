import { useMutation, useQuery } from '@apollo/react-hooks'

import { UPDATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'
import tagSelectProps, { backendToSelect } from '../tagSelectUtils'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import generateTempId from '../../lib/generateTempId'

const useEditCourseDialog = (workspaceId, isStaff) => {
  const { openDialog } = useDialog()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const [updateCourse] = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })

  const createOptimisticResponse = ({ name, description, official, frozen, tags, id }) => ({
    __typename: 'Mutation',
    updateCourse: {
      __typename: 'Course',
      id,
      name,
      description,
      official,
      frozen,
      tags: tags.map(tag => ({
        ...tag,
        id: tag.id || generateTempId(),
        priority: tag.priority || 0,
        __typename: 'Tag'
      }))
    }
  })

  return ({ id, name, description, official, frozen, tags }) => openDialog({
    mutation: updateCourse,
    createOptimisticResponse,
    type: 'Course',
    requiredVariables: { id, official: false },
    actionText: 'Save',
    title: 'Edit course',
    content: [
      'Courses can be connected to other courses as prerequisites.'
    ],
    fields: [{
      name: 'name',
      defaultValue: name,
      required: true
    }, {
      name: 'description',
      defaultValue: description,
      multiline: true
    }, {
      name: 'official',
      type: 'checkbox',
      defaultValue: official,
      hidden: !isStaff
    }, {
      name: 'frozen',
      type: 'checkbox',
      defaultValue: frozen,
      hidden: !isStaff
    }, {
      type: 'select',
      name: 'tags',
      label: 'Themes...',
      ...tagSelectProps(tags),
      values: backendToSelect(workspaceQuery.data.workspaceById.courseTags)
    }]
  })
}

export default useEditCourseDialog
