import gql from 'graphql-tag'

import {
  CREATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT,
  DELETE_CONCEPT_OBJECTIVE_LINK_FRAGMENT,
  UPDATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT
} from '../Fragment'

const CREATE_CONCEPT_OBJECTIVE_LINK = gql`
mutation createConceptObjectiveLink($to: ID!, $from: ID!, $workspaceId: ID!, $official: Boolean) {
  createConceptObjectiveLink(to: $to, from: $from, workspaceId: $workspaceId, official: $official) {
    ...createConceptObjectiveLinkData
  }
}
${CREATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT}
`

const UPDATE_CONCEPT_OBJECTIVE_LINK = gql`
mutation updateConceptObjectiveLink($id: ID!, $frozen: Boolean, $official: Boolean) {
  updateConceptObjectiveLink(id: $id, official: $official, frozen: $frozen) {
    ...updateConceptObjectiveLinkData
  }
}
${UPDATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT}
`

const DELETE_CONCEPT_OBJECTIVE_LINK = gql`
mutation deleteConceptObjectiveLink($id: ID!) {
  deleteConceptObjectiveLink(id: $id) {
    ...deleteConceptObjectiveLinkData
  }
}
${DELETE_CONCEPT_OBJECTIVE_LINK_FRAGMENT}
`

export {
  CREATE_CONCEPT_OBJECTIVE_LINK,
  UPDATE_CONCEPT_OBJECTIVE_LINK,
  DELETE_CONCEPT_OBJECTIVE_LINK
}
