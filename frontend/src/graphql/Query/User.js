import { gql } from 'apollo-boost'

const STAFF_BY_ID = gql`
query userById($id: ID!) {
  userById(id: $id) {
    id
    asWorkspaceOwner {
      id
      name
      owner {
        id
      }
    }
    asProjectOwner {
      id
      name
      owner {
        id
      }
    }
    asProjectParticipant {
      id
      name
      owner {
        id
      }
    }
  }
}
`

export {
  STAFF_BY_ID
}