import gql from 'graphql-tag'

export const USER_FRAGMENT = gql`
fragment UserInfo on User {
  id
  tmcId
  googleId
  hakaId
  role
  seenGuides
}
`

const AUTH_FRAGMENT = gql`
fragment AuthInfo on AuthPayload {
  token
  user {
    ...UserInfo
  }
}
${USER_FRAGMENT}
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
  mergeUser(accessToken: $accessToken) {
    ...UserInfo
  }
}
${USER_FRAGMENT}
`

const DISCONNECT_AUTH = gql`
mutation disconnectAuth($authType: AuthType!) {
  disconnectAuth(authType: $authType) {
    ...UserInfo
  }
}
${USER_FRAGMENT}
`

export {
  AUTHENTICATE,
  AUTHENTICATE_GOOGLE,
  CREATE_GUEST_ACCOUNT,
  MERGE_USER,
  DISCONNECT_AUTH
}
