import { gql } from 'apollo-boost'

const ALL_WORKSPACES = gql`
{
  allWorkspaces {
    id
    name
    owner {
      id
    }
  }
}
`

const WORKSPACES_BY_OWNER = gql`
query workspacesByOwner($ownerId: ID!) {
  workspacesByOwner(ownerId: $ownerId) {
    id
    name
    owner {
      id
    }
  }
}
`


export {
  ALL_WORKSPACES,
  WORKSPACES_BY_OWNER
}