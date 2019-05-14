import { gql } from 'apollo-boost'

const CREATE_RESOURCE = gql`
mutation createResource($name: String!, $concept_id: ID!, $desc: String!, $urls: [String!]!) {
  createResourceWithURLs(name: $name, concept_id:$concept_id, desc:$desc, urls:$urls) {
    id
    name
    urls {
      id
      address
    }
  }
}
`

export { CREATE_RESOURCE }