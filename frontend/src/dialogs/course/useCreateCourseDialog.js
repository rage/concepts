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

  const randomString = () => Math.random().toString(36)
  const generateTempId = () => randomString().substring(2, 15) + randomString().substring(2, 15)

  const createOptimisticResponse = ({ name, official, frozen, tags }) => ({
    __typename: 'Mutation',
    createCourse: {
      __typename: 'Course',
      id: generateTempId(),
      name,
      official,
      frozen,
      tags: tags.map(tag => ({ ...tag, __typename: 'Tag' })),
      linksToCourse: [],
      concepts: [],
      linksToConcept: []
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
