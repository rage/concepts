import { gql } from 'apollo-boost'

const CREATE_GUEST_ACCOUNT = gql`
mutation createGuest {
  createGuest {
    token
    user {
      id
      role
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
      }
    }
  }
`

const AUTHENTICATE_GOOGLE = gql`
  mutation authenticateGoogleUser($idToken: String!) {
    loginGoogle(idToken: $idToken) {
      token
      user {
        id
        role
      }
    }
  }
`

export {
  AUTHENTICATE,
  AUTHENTICATE_GOOGLE,
  CREATE_GUEST_ACCOUNT
}
