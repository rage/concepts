import gql from 'graphql-tag'

const PROJECTS_FOR_USER = gql`
query projectsForUser {
  projectsForUser {
    privilege
    project {
      id
      name
    }
  }
}
`

const PROJECT_BY_ID = gql`
query projectById($id: ID!) {
  projectById(id: $id) {
    id
    name
    tokens {
      id
      privilege
    }
    workspaces {
      id
      name
      participants {
        privilege
        user {
          id
        }
      }
    }
    templates {
      id
      name
      tokens {
        id
        privilege
      }
    }
    merges {
      id
      name
    }
    activeTemplate {
      id
      name
      courses {
        id
        name
      }
      pointGroups {
        id
        name
        startDate
        endDate
        maxPoints
        pointsPerConcept
        course {
          id
        }
      }
      mainCourse {
        id
      }
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

const PROJECT_BY_ID_MEMBER_INFO = gql`
query projectMemberInfo($id: ID!) {
  projectMemberInfo(id: $id) {
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

const PROJECT_BY_ID_TEMPLATES = gql`
query projectById($id: ID!) {
  projectById(id: $id) {
    id
    name
    templates {
      id
      name
    }
  }
}
`

const PEEK_ACTIVE_TEMPLATE = gql`
query limitedProjectById($id: ID!) {
  limitedProjectById(id: $id) {
    id
    name
    activeTemplateId
  }
}
`

const PROJECT_STATISTICS = gql`
query projectStatistics($id: ID!) {
  projectStatistics(id: $id) {
    links
    concepts
    participants
    maxPoints
    completedPoints
    pointList {
      amount
      value
    }
  }
}
`

export {
  PROJECTS_FOR_USER,
  PROJECT_BY_ID,
  PROJECT_BY_ID_MEMBER_INFO,
  PROJECT_BY_ID_TEMPLATES,
  PEEK_ACTIVE_TEMPLATE,
  PROJECT_STATISTICS
}
