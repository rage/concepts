import gql from 'graphql-tag'

const OBJECTIVE_LINK_CREATED = gql`
subscription($workspaceId: ID!) {
  objectiveLinkCreated(workspaceId: $workspaceId) {
    __typename
    id
    text
    course {
      id
    }
    goal {
      id
    }
    workspace {
      id
    }
  }
}
`

const OBJECTIVE_LINK_UPDATED = gql`
subscription($workspaceId: ID!) {
  objectiveLinkUpdated(workspaceId: $workspaceId) {
    __typename
    id
    text
    course {
      id
    }
    goal {
      id
    }
    workspace {
      id
    }
  }
}
`

const OBJECTIVE_LINK_DELETED = gql`
subscription($workspaceId: ID!) {
  objectiveLinkDeleted(workspaceId: $workspaceId) {
    __typename
    id
    workspaceId
    courseId
  }
}
`

export {
  OBJECTIVE_LINK_CREATED,
  OBJECTIVE_LINK_UPDATED,
  OBJECTIVE_LINK_DELETED
}
