import { gql } from 'apollo-boost'

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
    asTemplate {
      id
    }
    courses {
      id
      name
      official
      frozen
      tags {
        id
        name
        type
        priority
      }
      concepts {
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
      }
    }
    tokens {
      id
      privilege
    }
    participants {
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
}
`

const WORKSPACE_BY_ID_MEMBER_INFO = gql`
query workspaceMemberInfo($id: ID!) {
  workspaceMemberInfo(id: $id) {
    participantId
    id
    role
    privilege
    token {
      id
      revoked
    }
    tmcId
    name
    email
    username
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
  WORKSPACES_FOR_USER,
  WORKSPACE_BY_ID,
  WORKSPACE_BY_ID_MEMBER_INFO,
  WORKSPACE_COURSES_AND_CONCEPTS,
  WORKSPACE_DATA_FOR_GRAPH,
  WORKSPACE_BY_SOURCE_TEMPLATE,
  COURSES_FOR_WORKSPACE_FRAGMENT
}
