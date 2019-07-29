import { gql } from 'apollo-boost'

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
    }
    templates {
      id
      name
      tokens {
        id
      }
    }
    activeTemplate {
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

export {
  PROJECTS_FOR_USER,
  PROJECT_BY_ID
}
