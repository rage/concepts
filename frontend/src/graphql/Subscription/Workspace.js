import gql from 'graphql-tag'

const WORKSPACE_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  workspaceUpdated(workspaceId: $workspaceId) {
    id
    name
    courseOrder
  }
}
`

const WORKSPACE_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  workspaceDeleted(workspaceId: $workspaceId) {
    id
  }
}
`

export {
  WORKSPACE_UPDATED_SUBSCRIPTION,
  WORKSPACE_DELETED_SUBSCRIPTION
}
