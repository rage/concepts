import { gql } from 'apollo-boost'

const CREATE_SHARE_LINK = gql`
  mutation createShareLink($workspaceId: ID!, $privilege: Privilege!) {
    createWorkspaceToken(workspaceId: $workspaceId, privilege: $privilege) {
      id
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
    deleteToken(id: $id) {
      ... on ProjectToken {
        id
      }
      ... on WorkspaceToken {
        id
      }
    }
  }
`

const USE_SHARE_LINK = gql`
  mutation useShareLink($token: ID!) {
    useToken(id: $token) {
      ... on ProjectParticipant {
        privilege
        project {
          id
          name
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
      ... on WorkspaceParticipant {
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
  }
`

export {
  CREATE_SHARE_LINK,
  DELETE_SHARE_LINK,
  USE_SHARE_LINK
}
