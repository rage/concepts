import gql from 'graphql-tag'

const COURSE_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseCreated(workspaceId:$workspaceId) {
    id
    name
  }
}
`

const COURSE_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  courseDeleted(workspaceId:$workspaceId) {
    id
    name
  }
}
`

export {
  COURSE_CREATED_SUBSCRIPTION,
  COURSE_DELETED_SUBSCRIPTION
}
