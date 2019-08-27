import { gql } from 'apollo-boost'

const PEEK_SHARE_LINK = gql`
  query peekShareLink($token: ID!) {
    peekToken(id: $token) {
      ... on Project {
        id
        name
        participants {
          privilege
          user {
            id
          }
        }
      }
      ... on LimitedProject {
        id
        name
        activeTemplateId
        participants {
          privilege
          user {
            id
          }
        }
      }
      ... on Workspace {
        id
        name
        participants {
          privilege
          user {
            id
          }
        }
      }
    }
  }
`

export {
  PEEK_SHARE_LINK
}
