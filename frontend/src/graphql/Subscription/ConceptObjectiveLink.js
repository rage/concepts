import gql from 'graphql-tag'

import {
  CREATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT,
  UPDATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT,
  DELETE_CONCEPT_OBJECTIVE_LINK_FRAGMENT
} from '../Fragment'

const CONCEPT_OBJECTIVE_LINK_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  conceptObjectiveLinkCreated(workspaceId: $workspaceId) {
    ...createConceptObjectiveLinkData
  }
}
${CREATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT}
`

const CONCEPT_OBJECTIVE_LINK_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  conceptObjectiveLinkUpdated(workspaceId: $workspaceId) {
    ...updateConceptObjectiveLinkData
  }
}
${UPDATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT}
`

const CONCEPT_OBJECTIVE_LINK_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  conceptObjectiveLinkDeleted(workspaceId: $workspaceId) {
    ...deleteConceptObjectiveLinkData
  }
}
${DELETE_CONCEPT_OBJECTIVE_LINK_FRAGMENT}
`

export {
  CONCEPT_OBJECTIVE_LINK_CREATED_SUBSCRIPTION,
  CONCEPT_OBJECTIVE_LINK_UPDATED_SUBSCRIPTION,
  CONCEPT_OBJECTIVE_LINK_DELETED_SUBSCRIPTION
}
