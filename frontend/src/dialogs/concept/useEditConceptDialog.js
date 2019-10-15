import { useMutation, useQuery } from 'react-apollo-hooks'

import { UPDATE_CONCEPT } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useDialog } from '../DialogProvider'
import tagSelectProps, { backendToSelect } from '../tagSelectUtils'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import generateTempId from '../../lib/generateTempId'

const useEditConceptDialog = (workspaceId, isStaff) => {
  const { openDialog } = useDialog()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate(workspaceId)
  })

  const createOptimisticResponse = ({ id, name, official, frozen, description, tags, course }) => ({
    __typename: 'Mutation',
    updateConcept: {
      __typename: 'Concept',
      id,
      name,
      description,
      official,
      frozen,
      course,
      tags: tags.map(tag => ({
        ...tag,
        __typename: 'Tag',
        id: tag.id | generateTempId(),
        priority: tag.priority | 0
      }))
    }
  })

  return ({ id, name, description, tags, official, frozen, course }) => openDialog({
    mutation: updateConcept,
    createOptimisticResponse: (args) => createOptimisticResponse({ ...args, course }),
    type: 'Concept',
    requiredVariables: { id, official: false },
    actionText: 'Save',
    title: 'Edit concept',
    fields: [{
      name: 'name',
      required: true,
      defaultValue: name
    }, {
      name: 'description',
      multiline: true,
      defaultValue: description
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
      label: 'Select tags...',
      ...tagSelectProps(tags),
      values: backendToSelect(workspaceQuery.data.workspaceById.conceptTags)
    }]
  })
}

export default useEditConceptDialog
