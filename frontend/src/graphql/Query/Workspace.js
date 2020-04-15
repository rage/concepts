import gql from 'graphql-tag'

import { COURSES_FOR_WORKSPACE_FRAGMENT } from '../Fragment'

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
    concepts {
      id
      name
      level
    }
    goalTags {
      id
      name
      type
      priority
    }
    courseTags {
      id
      name
      type
      priority
    }
    conceptTags {
      id
      name
      type
      priority
    }
    courseOrder
    commonConcepts {
      id
      name
      description
      level
      official
      frozen
      tags {
        id
        name
        type
        priority
      }
    }
    goalLinks {
      id
      text
      course {
        id
      }
      goal {
        id
      }
    }
    objectiveLinks {
      id
      text
      weight
      course {
        id
      }
      objective {
        id
      }
    }
    goals {
      id
      name
      description
      level
      official
      frozen
      tags {
        id
        name
        type
        priority
      }
    }
    courses {
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
      conceptOrder
      objectiveOrder
      concepts {
        id
        name
        description
        level
        official
        frozen
        course {
          id
        }
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
  WORKSPACE_BY_SOURCE_TEMPLATE,
  COURSES_FOR_WORKSPACE_FRAGMENT
}
