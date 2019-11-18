import gql from 'graphql-tag'

const UPDATE_SEEN_GUIDES = gql`
mutation updateSeenGuides($id: ID!, $seenGuides: [String!]) {
  updateSeenGuides(id: $id, seenGuides: $seenGuides) {
    id
    seenGuides
  }
}
`

export {
  UPDATE_SEEN_GUIDES
}
