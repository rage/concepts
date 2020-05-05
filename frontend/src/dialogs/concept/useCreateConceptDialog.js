import { useMutation, useQuery } from '@apollo/react-hooks'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { useDialog } from '../DialogProvider'
import cache from '../../apollo/update'
import tagSelectProps, { backendToSelect } from '../tagSelectUtils'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import generateTempId from '../../lib/generateTempId'

const useCreateConceptDialog = (workspaceId, isStaff, defaultLevel = 'CONCEPT') => {
  const { openDialog } = useDialog()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const [createConcept] = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })

  const createOptimisticResponse = ({
    courseId, name, official, frozen, description, tags, level, position
  }) => ({
    __typename: 'Mutation',
    createConcept: {
      __typename: 'Concept',
      id: generateTempId(),
      name,
      description,
      level,
      position,
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

  return ({
    courseId, level = defaultLevel, name = '', description = '', position = null
  }) => openDialog({
    mutation: createConcept,
    createOptimisticResponse,
    type: level.toTitleCase(),
    requiredVariables: {
      workspaceId,
      courseId,
      official: false,
      position,
      level
    },
    actionText: 'Create',
    title: `Add ${level.toLowerCase()}`,
    fields: [{
      name: 'name',
      required: true,
      defaultValue: name
    }, {
      name: 'description',
      multiline: true,
      defaultValue: description
    }, {
      name: 'official',
      type: 'checkbox',
      hidden: !isStaff
    }, {
      name: 'frozen',
      type: 'checkbox',
      hidden: !isStaff
    }, {
      type: 'select',
      name: 'tags',
      label: 'Select tags...',
      ...tagSelectProps(),
      values: backendToSelect(workspaceQuery.data.workspaceById.conceptTags)
    }]
  })
}

export default useCreateConceptDialog
