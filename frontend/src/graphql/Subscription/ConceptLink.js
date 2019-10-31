import gql from 'graphql-tag'

import { CREATE_CONCEPT_LINK_FRAGMENT, DELETE_CONCEPT_LINK_FRAGMENT } from '../Fragment'

const CONCEPT_LINK_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  conceptLinkCreated(workspaceId: $workspaceId) {
    ...createConceptLinkData
  }
}
${CREATE_CONCEPT_LINK_FRAGMENT}
`

const CONCEPT_LINK_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  conceptLinkDeleted(workspaceId: $workspaceId) {
    ...deleteConceptLinkData
  }
}
${DELETE_CONCEPT_LINK_FRAGMENT}
`

export {
  CONCEPT_LINK_CREATED_SUBSCRIPTION,
  CONCEPT_LINK_DELETED_SUBSCRIPTION
}
