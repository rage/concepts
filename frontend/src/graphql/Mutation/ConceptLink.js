import { gql } from 'apollo-boost'

const CREATE_CONCEPT_LINK = gql`
mutation createConceptLink($to: ID!, $from: ID!, $workspaceId: ID!, $official: Boolean) {
  createConceptLink(to: $to, from: $from, workspaceId: $workspaceId, official: $official) {
    id
    official
    frozen
    to {
      id
    }
    from {
      id
      course {
        id
      }
    }
  }
}
`

const DELETE_CONCEPT_LINK = gql`
mutation deleteConceptLink($id: ID!) {
  deleteConceptLink(id: $id) {
    id
  }
}
`

export {
  CREATE_CONCEPT_LINK,
  DELETE_CONCEPT_LINK
}
