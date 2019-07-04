import { gql } from 'apollo-boost'

const ALL_WORKSPACES = gql`
{
  allWorkspaces {
    id
    name
    owner {
      id
    }
  }
}
`

const WORKSPACES_BY_OWNER = gql`
query workspacesByOwner($ownerId: ID!) {
  workspacesByOwner(ownerId: $ownerId) {
    id
    name
    owner {
      id
    }
  }
}
`

const WORKSPACE_BY_ID = gql`
query workspaceById($id: ID!) {
  workspaceById(id: $id) {
    id
    name
    defaultCourse {
      id
    }
    owner {
      id
    }
  }
}
`

const WORKSPACE_COURSES_AND_CONCEPTS = gql`
query workspaceById($id: ID!) {
workspaceById(id: $id) {
  id
  courses {
    id
    name
    concepts {
      id
      name
      linksToConcept {
        from {
          id
          name
          courses {
            id
          }
        }
      }
    }
  }
}
}
`

export {
  ALL_WORKSPACES,
  WORKSPACES_BY_OWNER,
  WORKSPACE_BY_ID,
  WORKSPACE_COURSES_AND_CONCEPTS
}
