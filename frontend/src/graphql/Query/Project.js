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
    participants {
      privilege
      user {
        id
      }
    }
  }
}
`

const PROJECT_AND_DATA = gql`
query projectAndData($id: ID!) {
  projectById(id: $id) {
    id
    name
    workspaces {
      id
      name
    }
    template {
      id
      name
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
  PROJECT_BY_ID,
  PROJECT_AND_DATA
}
