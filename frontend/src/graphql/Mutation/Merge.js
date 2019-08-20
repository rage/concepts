import { gql } from 'apollo-boost'

const MERGE_PROJECT = gql`
mutation mergeProject($projectId: ID!) {
  mergeWorkspaces(projectId: $projectId) {
    id
  }
}
`

export {
  MERGE_PROJECT
}
