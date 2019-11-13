import gql from 'graphql-tag'

const WORKPACE_MEMBER_CREATED = gql`
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

const WORKSPACE_MEMBER_DELETED = gql`
subscription($workspaceId: ID!) {
  workspaceMemberDeleted(workspaceId: $workspaceId) {
    id
  }
}
`

const WORKSPACE_MEMBER_UPDATED = gql`
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

const PROJECT_MEMBER_CREATED = gql`
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

const PROJECT_MEMBER_DELETED = gql`
subscription($projectId: ID!) {
  projectMemberDeleted(projectId: $projectId) {
    id
  }
}
`

const PROJECT_MEMBER_UPDATED = gql`
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
  WORKPACE_MEMBER_CREATED,
  WORKSPACE_MEMBER_DELETED,
  WORKSPACE_MEMBER_UPDATED,
  PROJECT_MEMBER_CREATED,
  PROJECT_MEMBER_DELETED,
  PROJECT_MEMBER_UPDATED
}
