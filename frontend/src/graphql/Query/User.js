import { gql } from 'apollo-boost'

const STAFF_BY_ID = gql`
query userById($id: ID!) {
  userById(id: $id) {
    id
    workspaceParticipations {
      privilege
      workspace {
        id
        name
      }
    }
    projectParticipations {
      privilege
      project {
        id
        name
      }
    }
  }
}
`

const USER_BY_ID = gql`
query userById($id: ID!) {
  userById(id: $id) {
    id
    role
    guideProgress
  }
}
`

export {
  STAFF_BY_ID,
  USER_BY_ID
}
