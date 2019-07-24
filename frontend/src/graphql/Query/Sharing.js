import { gql } from 'apollo-boost'

const PEEK_SHARE_LINK = gql`
  query peekShareLink($token: ID!) {
    peekWorkspace(tokenId: $token) {
      id
      name
      courses {
        id
      }
      tokens {
        id
      }
      participants {
        privilege
        user {
          id
        }
      }
    }
  }
`

export {
  PEEK_SHARE_LINK
}
