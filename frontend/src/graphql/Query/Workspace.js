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

const COURSES_FOR_WORKSPACE_FRAGMENT = gql`
fragment coursesForWorkspace on Workspace {
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
      description
      courses {
        id
      }
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
`

const WORKSPACES_FOR_USER = gql`
query workspacesForUser {
  workspacesForUser {
    privilege
    workspace {
      id
      name
      asTemplate {
        id
      }
      tokens {
        id
        privilege
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
      name
      concepts {
        id
        name
        description
      }
    }
    tokens {
      id
      privilege
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
  ...coursesForWorkspace
}
}
${COURSES_FOR_WORKSPACE_FRAGMENT}
`

const WORKSPACE_COURSES_AND_CONCEPTS = gql`
query workspaceById($id: ID!) {
workspaceById(id: $id) {
  id
  ...coursesForWorkspace
}
}
${COURSES_FOR_WORKSPACE_FRAGMENT}
`

const WORKSPACE_BY_SOURCE_TEMPLATE = gql`
query workspaceBySourceTemplate($sourceId: ID!) {
  workspaceBySourceTemplate(sourceId: $sourceId) {
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
  WORKSPACE_BY_SOURCE_TEMPLATE,
  COURSES_FOR_WORKSPACE_FRAGMENT
}
