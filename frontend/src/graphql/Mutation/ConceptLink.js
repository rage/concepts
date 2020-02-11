import gql from 'graphql-tag'

import { CREATE_CONCEPT_LINK_FRAGMENT, UPDATE_CONCEPT_LINK_FRAGMENT, DELETE_CONCEPT_LINK_FRAGMENT } from '../Fragment'

const CREATE_CONCEPT_LINK = gql`
mutation createConceptLink($to: ID!, $from: ID!, $workspaceId: ID!, $official: Boolean,
                           $text: String) {
  createConceptLink(to: $to, from: $from, workspaceId: $workspaceId, official: $official,
                    text: $text) {
    ...createConceptLinkData
  }
}
${CREATE_CONCEPT_LINK_FRAGMENT}
`

const UPDATE_CONCEPT_LINK = gql`
mutation updateConceptLink($id: ID!, $official: Boolean, $text: String) {
  updateConceptLink(id: $id, official: $official, text: $text) {
    ...createConceptLinkData
  }
}
${UPDATE_CONCEPT_LINK_FRAGMENT}
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
