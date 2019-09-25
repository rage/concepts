import { gql } from 'apollo-boost'

const CREATE_GUEST_ACCOUNT = gql`
mutation createGuest {
  createGuest {
    token
    user {
      id,
      role
      guideProgress
    }
  }
}
`

const AUTHENTICATE = gql`
mutation authenticateUser($tmcToken: String!) {
  login(tmcToken: $tmcToken) {
    token
    user {
      id
      role
      guideProgress
    }
  }
}
`

export {
  AUTHENTICATE,
  CREATE_GUEST_ACCOUNT
}
