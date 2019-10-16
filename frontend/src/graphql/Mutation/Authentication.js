import { gql } from 'apollo-boost'

const AUTH_FRAGMENT = gql`
fragment AuthInfo on AuthPayload {
  token
  user {
    id
    tmcId
    googleId
    hakaId
    role
  }
}
`

const CREATE_GUEST_ACCOUNT = gql`
mutation createGuest {
  createGuest {
    ...AuthInfo
  }
}
${AUTH_FRAGMENT}
`

const AUTHENTICATE = gql`
mutation authenticateUser($tmcToken: String!) {
  login(tmcToken: $tmcToken) {
    ...AuthInfo
  }
}
${AUTH_FRAGMENT}
`

const AUTHENTICATE_GOOGLE = gql`
mutation authenticateGoogleUser($idToken: String!) {
  loginGoogle(idToken: $idToken) {
    ...AuthInfo
  }
}
${AUTH_FRAGMENT}
`

const MERGE_USER = gql`
mutation mergeUser($accessToken: String!) {
  mergeUser(accessToken: $accessToken)
}
`

export {
  AUTHENTICATE,
  AUTHENTICATE_GOOGLE,
  CREATE_GUEST_ACCOUNT,
  MERGE_USER
}
