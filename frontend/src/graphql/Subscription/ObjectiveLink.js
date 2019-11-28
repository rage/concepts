import gql from 'graphql-tag'

import {
  CREATE_OBJECTIVE_LINK_FRAGMENT,
  UPDATE_OBJECTIVE_LINK_FRAGMENT,
  DELETE_OBJECTIVE_LINK_FRAGMENT
} from '../Fragment'

const OBJECTIVE_LINK_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  objectiveLinkCreated(workspaceId: $workspaceId) {
    ...createObjectiveLinkData
  }
}
${CREATE_OBJECTIVE_LINK_FRAGMENT}
`

const OBJECTIVE_LINK_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  objectiveLinkUpdated(workspaceId: $workspaceId) {
    ...updateObjectiveLinkData
  }
}
${UPDATE_OBJECTIVE_LINK_FRAGMENT}
`

const OBJECTIVE_LINK_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  objectiveLinkDeleted(workspaceId: $workspaceId) {
    ...deleteObjectiveLinkData
  }
}
${DELETE_OBJECTIVE_LINK_FRAGMENT}
`

export {
  OBJECTIVE_LINK_CREATED_SUBSCRIPTION,
  OBJECTIVE_LINK_UPDATED_SUBSCRIPTION,
  OBJECTIVE_LINK_DELETED_SUBSCRIPTION
}
