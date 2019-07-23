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

export {
  CREATE_SHARE_LINK,
  DELETE_SHARE_LINK
}
