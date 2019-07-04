import { gql } from 'apollo-boost'

const PROJECTS_BY_OWNER = gql`
query projectsByOwner($ownerId: ID!) {
  projectsByOwner(ownerId: $ownerId) {
    id
    name
    owner {
      id
    }
  }
}
`

const PROJECT_BY_ID = gql`
query projectById($id: ID!) {
  projectById(id: $id) {
    id
    name
    owner {
      id
    }
  }
}
`

export {
  PROJECTS_BY_OWNER,
  PROJECT_BY_ID
}
