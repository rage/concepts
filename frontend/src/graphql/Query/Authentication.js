import { gql } from 'apollo-boost'

import { USER_FRAGMENT } from '../Mutation/Authentication'

const GET_GOOGLE_CLIENT_ID = gql`
query googleClientId {
  googleClientId {
    enabled
    clientId
  }
}
`

const GET_HAKA_LOGIN_URL = gql`
query hakaLoginUrl {
  hakaLoginUrl {
    enabled
    url
  }
}
`

const GET_CURRENT_USER = gql`
query currentUser {
  currentUser {
    ...UserInfo
  }
}
${USER_FRAGMENT}
`

export {
  GET_GOOGLE_CLIENT_ID,
  GET_HAKA_LOGIN_URL,
  GET_CURRENT_USER
}
