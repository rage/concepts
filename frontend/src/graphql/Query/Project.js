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

export {
  PROJECTS_FOR_USER,
  PROJECT_BY_ID
}
