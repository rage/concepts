import { gql } from 'apollo-boost'

const ALL_WORKSPACES = gql`
{
  allWorkspaces {
    id
    name
    participants {
      privilege
      user {
        id
      }
    }
  }
}
`

const WORKSPACES_FOR_USER = gql`
query workspacesForUser {
  workspacesForUser {
    privilege
    workspace {
      id
      name
      tokens {
        id
      }
    }
  }
}
`

const WORKSPACE_BY_ID = gql`
query workspaceById($id: ID!) {
  workspaceById(id: $id) {
    id
    name
    courses {
      id
    }
    tokens {
      id
    }
    participants {
      privilege
      user {
        id
      }
    }
  }
}
`

const WORKSPACE_DATA_FOR_GRAPH = gql`
query workspaceById($id: ID!) {
workspaceById(id: $id) {
  id
  courses {
    id
    name
    linksToCourse {
      from {
        id
      }
    }
    concepts {
      id
      name
      linksToConcept {
        from {
          id
        }
      }
    }
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

const WORKSPACE_BY_SOURCE_TEMPLATE = gql`
query workspaceBySourceTemplate($id: ID!) {
  workspaceBySourceTemplate(id: $id) {
    id
    name
  }
}
`

export {
  ALL_WORKSPACES,
  WORKSPACES_FOR_USER,
  WORKSPACE_BY_ID,
  WORKSPACE_COURSES_AND_CONCEPTS,
  WORKSPACE_DATA_FOR_GRAPH,
  WORKSPACE_BY_SOURCE_TEMPLATE
}
