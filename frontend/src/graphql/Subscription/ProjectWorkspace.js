import gql from 'graphql-tag'

const PROJECT_WORKSPACE_CREATED_SUBSCRIPTION = gql`
subscription($projectId: ID!) {
  projectWorkspaceCreated(projectId: $projectId) {
    id
    name
    asTemplate {
      id
    }
    asMerge {
      id
    }
    sourceProject {
      id
    }
    participants {
      privilege
      user {
        id
      }
    }
    tokens {
      id
      privilege
    }
  }
}
`

export {
  PROJECT_WORKSPACE_CREATED_SUBSCRIPTION
}
