import gql from 'graphql-tag'

import {
  CREATE_OBJECTIVE_FRAGMENT,
  UPDATE_OBJECTIVE_FRAGMENT,
  DELETE_OBJECTIVE_FRAGMENT
} from '../Fragment'

const OBJECTIVE_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  objectiveCreated(workspaceId:$workspaceId) {
    ...createObjectiveData
  }
}
${CREATE_OBJECTIVE_FRAGMENT}
`

const OBJECTIVE_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  objectiveUpdated(workspaceId:$workspaceId) {
    ...updateObjectiveData
  }
}
${UPDATE_OBJECTIVE_FRAGMENT}
`

const OBJECTIVE_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  objectiveDeleted(workspaceId:$workspaceId) {
    ...deleteObjectiveData
  }
}
${DELETE_OBJECTIVE_FRAGMENT}
`

export {
  OBJECTIVE_CREATED_SUBSCRIPTION,
  OBJECTIVE_DELETED_SUBSCRIPTION,
  OBJECTIVE_UPDATED_SUBSCRIPTION
}
