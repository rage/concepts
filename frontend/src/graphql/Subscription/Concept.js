import gql from 'graphql-tag'

import {
  CREATE_CONCEPT_FRAGMENT,
  UPDATE_CONCEPT_FRAGMENT,
  DELETE_CONCEPT_FRAGMENT
} from '../Fragment'

const CONCEPT_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  conceptCreated(workspaceId:$workspaceId) {
    ...createConceptData
  }
}
${CREATE_CONCEPT_FRAGMENT}
`

const CONCEPT_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  conceptUpdated(workspaceId:$workspaceId) {
    ...updateConceptData
  }
}
${UPDATE_CONCEPT_FRAGMENT}
`

const CONCEPT_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  conceptDeleted(workspaceId:$workspaceId) {
    ...deleteConceptData
  }
}
${DELETE_CONCEPT_FRAGMENT}
`

export {
  CONCEPT_CREATED_SUBSCRIPTION,
  CONCEPT_DELETED_SUBSCRIPTION,
  CONCEPT_UPDATED_SUBSCRIPTION
}
