import gql from 'graphql-tag'

import {
  CREATE_OBJECTIVE_LINK_FRAGMENT,
  DELETE_OBJECTIVE_LINK_FRAGMENT,
  UPDATE_OBJECTIVE_LINK_FRAGMENT
} from '../Fragment'

const CREATE_OBJECTIVE_LINK = gql`
mutation createObjectiveLink($to: ID!, $from: ID!, $workspaceId: ID!, $official: Boolean) {
  createObjectiveLink(to: $to, from: $from, workspaceId: $workspaceId, official: $official) {
    ...createObjectiveLinkData
  }
}
${CREATE_OBJECTIVE_LINK_FRAGMENT}
`

const UPDATE_OBJECTIVE_LINK = gql`
mutation updateObjectiveLink($id: ID!, $frozen: Boolean, $official: Boolean) {
  updateObjectiveLink(id: $id, official: $official, frozen: $frozen) {
    ...updateObjectiveLinkData
  }
}
${UPDATE_OBJECTIVE_LINK_FRAGMENT}
`

const DELETE_OBJECTIVE_LINK = gql`
mutation deleteObjectiveLink($id: ID!) {
  deleteObjectiveLink(id: $id) {
    ...deleteObjectiveLinkData
  }
}
${DELETE_OBJECTIVE_LINK_FRAGMENT}
`

export {
  CREATE_OBJECTIVE_LINK,
  UPDATE_OBJECTIVE_LINK,
  DELETE_OBJECTIVE_LINK
}
