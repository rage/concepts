import { useMutation, useQuery } from 'react-apollo-hooks'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { useDialog } from '../DialogProvider'
import cache from '../../apollo/update'
import tagSelectProps, { backendToSelect } from '../tagSelectUtils'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import generateTempId from '../../lib/generateTempId'

const useCreateConceptDialog = (workspaceId, isStaff, level = 'CONCEPT') => {
  const { openDialog } = useDialog()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })

  const createOptimisticResponse = ({
    courseId, name, official, frozen, description, tags, level
  }) => ({
    __typename: 'Mutation',
    createConcept: {
      __typename: 'Concept',
      id: generateTempId(),
      name,
      description,
      level,
      position: null,
      official,
      frozen,
      course: {
        __typename: 'Course',
        id: courseId
      },
      tags: tags.map(tag => ({
        ...tag,
        __typename: 'Tag',
        id: tag.id || generateTempId(),
        priority: tag.priority || 0
      })),
      linksFromConcept: [],
      linksToConcept: []
    }
  })

  return courseId => openDialog({
    mutation: createConcept,
    createOptimisticResponse,
    type: level.toTitleCase(),
    requiredVariables: {
      workspaceId,
      courseId,
      official: false,
      level
    },
    actionText: 'Create',
    title: `Add ${level.toLowerCase()}`,
    fields: [{
      name: 'name',
      required: true
    }, {
      name: 'description',
      multiline: true
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
    },
    {
      type: 'select',
      name: 'tags',
      label: 'Select tags...',
      ...tagSelectProps(),
      values: backendToSelect(workspaceQuery.data.workspaceById.conceptTags)
    }]
  })
}

export default useCreateConceptDialog
