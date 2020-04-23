import { useMutation, useQuery } from '@apollo/react-hooks'

import { CREATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'
import tagSelectProps, { backendToSelect } from '../tagSelectUtils'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import generateTempId from '../../lib/generateTempId'

const useCreateCourseDialog = (workspaceId, isStaff) => {
  const { openDialog } = useDialog()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const [createCourse] = useMutation(CREATE_COURSE, {
    update: cache.createCourseUpdate(workspaceId)
  })

  const createOptimisticResponse = ({ name, official, frozen, tags }) => ({
    __typename: 'Mutation',
    createCourse: {
      __typename: 'Course',
      id: generateTempId(),
      name,
      official,
      frozen,
      tags: tags.map(tag => ({
        ...tag,
        id: tag.id || generateTempId(),
        priority: tag.priority || 0,
        __typename: 'Tag'
      })),
      linksFromCourse: [],
      linksToCourse: [],
      conceptOrder: [],
      objectiveOrder: [],
      concepts: []
    }
  })

  return () => openDialog({
    mutation: createCourse,
    createOptimisticResponse,
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
