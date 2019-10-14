import { gql } from 'apollo-boost'

const GET_GOOGLE_CLIENT_ID = gql`
query googleClientId {
  googleClientId {
    enabled
    clientId
  }
}
`

export {
  GET_GOOGLE_CLIENT_ID
}
