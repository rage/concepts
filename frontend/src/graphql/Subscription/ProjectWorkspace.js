import gql from 'graphql-tag'

const PROJECT_WORKSPACE_CLONED_SUBSCRIPTION = gql`
subscription($projectId: ID!) {
  projectWorkspaceCloned(projectId: $projectId) {
    id
  }
}
`

export {
  PROJECT_WORKSPACE_CLONED_SUBSCRIPTION
}