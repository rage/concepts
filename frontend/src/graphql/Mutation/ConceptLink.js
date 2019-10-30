import gql from 'graphql-tag'

import { CREATE_CONCEPT_LINK_FRAGMENT, DELETE_CONCEPT_LINK_FRAGMENT } from '../Fragment'

const CREATE_CONCEPT_LINK = gql`
mutation createConceptLink($to: ID!, $from: ID!, $workspaceId: ID!, $official: Boolean) {
  createConceptLink(to: $to, from: $from, workspaceId: $workspaceId, official: $official) {
    ...createConceptLinkData
  }
}
${CREATE_CONCEPT_LINK_FRAGMENT}
`

const DELETE_CONCEPT_LINK = gql`
mutation deleteConceptLink($id: ID!) {
  deleteConceptLink(id: $id) {
    ...deleteConceptLinkData
  }
}
${DELETE_CONCEPT_LINK_FRAGMENT}
`

export {
  CREATE_CONCEPT_LINK,
  DELETE_CONCEPT_LINK
}
