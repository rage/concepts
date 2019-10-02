import { gql } from 'apollo-boost'

const MERGE_PROJECT = gql`
mutation mergeProject($projectId: ID!) {
  mergeWorkspaces(projectId: $projectId) {
    id
  }
}
`

// TODO move merge concept return data into fragment with create concept data?
const MERGE_CONCEPTS = gql`
mutation mergeConcepts($workspaceId: ID!, $courseId: ID!, $conceptIds: [ID!]!, $name: String,
                       $description: String, $official: Boolean, $tags: [TagInput!]) {
  mergeConcepts(workspaceId: $workspaceId, courseId: $courseId, conceptIds: $conceptIds,
                name: $name, description: $description, official: $official, tags: $tags) {
    __typename
    id
    name
    description
    official
    frozen
    tags {
      id
      name
      type
      priority
    }
    course {
      id
    }
    linksFromConcept {
      id
      official
      to {
        id
      }
    }
    linksToConcept {
      id
      official
      from {
        id
      }
    }
  }
}
`

export {
  MERGE_PROJECT,
  MERGE_CONCEPTS
}
