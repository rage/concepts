import gql from 'graphql-tag'

const WORKSPACE_MEMBER_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  workspaceMemberCreated(workspaceId: $workspaceId) {
    id
    privilege
    token {
      id
      revoked
    }
    user {
      id
      role
    }
  }
}
`

const WORKSPACE_MEMBER_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  workspaceMemberDeleted(workspaceId: $workspaceId) {
    id
  }
}
`

const WORKSPACE_MEMBER_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  workspaceMemberUpdated(workspaceId: $workspaceId) {
    id
    privilege
    token {
      id
      revoked
    }
    user {
      id
      role
    }
  }
}
`

const PROJECT_MEMBER_CREATED_SUBSCRIPTION = gql`
subscription($projectId: ID!) {
  projectMemberCreated(projectId: $projectId) {
    id
    privilege
    token {
      id
      revoked
    }
    user {
      id
      role
    }
  }
}
`

const PROJECT_MEMBER_DELETED_SUBSCRIPTION = gql`
subscription($projectId: ID!) {
  projectMemberDeleted(projectId: $projectId) {
    id
  }
}
`

const PROJECT_MEMBER_UPDATED_SUBSCRIPTION = gql`
subscription($projectId: ID!) {
  projectMemberUpdated(projectId: $projectId) {
    id
    privilege
    token {
      id
      revoked
    }
    user {
      id
      role
    }
  }
}
`

export {
  WORKSPACE_MEMBER_CREATED_SUBSCRIPTION,
  WORKSPACE_MEMBER_DELETED_SUBSCRIPTION,
  WORKSPACE_MEMBER_UPDATED_SUBSCRIPTION,
  PROJECT_MEMBER_CREATED_SUBSCRIPTION,
  PROJECT_MEMBER_DELETED_SUBSCRIPTION,
  PROJECT_MEMBER_UPDATED_SUBSCRIPTION
}
