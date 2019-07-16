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

const USER_BY_ID = gql`
query userById($id: ID!) {
  userById(id: $id) {
    id
    tmcId
    role
    guideProgress
  }
}
`

export {
  STAFF_BY_ID,
  USER_BY_ID
}
