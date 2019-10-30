import gql from 'graphql-tag'

const CONCEPT_LINK_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  conceptLinkCreated(workspaceId: $workspaceId) {
    id
    official
    frozen
    to {
      id
      course {
        id
      }
    }
    from {
      id
      course {
        id
      }
    }
  }
}
`

const CONCEPT_LINK_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  conceptLinkDeleted(workspaceId: $workspaceId) {
    id
    courseId
  }
}
`

export {
  CONCEPT_LINK_CREATED_SUBSCRIPTION,
  CONCEPT_LINK_DELETED_SUBSCRIPTION
}
