import { gql } from 'apollo-boost'

const CREATE_SHARE_LINK = gql`
  mutation createShareLink($workspaceId: ID!, $privilege: Privilege!) {
    createWorkspaceToken(workspaceId: $workspaceId, privilege: $privilege) {
      id
      privilege
      revoked
      workspace {
        id
      }
    }
  }
`

const DELETE_SHARE_LINK = gql`
  mutation deleteShareLink($id: ID!) {
    deleteWorkspaceToken(id: $id) {
      id
    }
  }
`

const USE_SHARE_LINK = gql`
  mutation useShareLink($token: ID!) {
    joinWorkspace(tokenId: $token) {
      privilege
      workspace {
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
  }
`

export {
  CREATE_SHARE_LINK,
  DELETE_SHARE_LINK,
  USE_SHARE_LINK
}
