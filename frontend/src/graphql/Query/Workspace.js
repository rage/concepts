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


export {
  ALL_WORKSPACES
}