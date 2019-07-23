import { gql } from 'apollo-boost'

const IMPORT_DATA = gql`
mutation importData($data: String!) {
  importData(data: $data) {
    id
    name
    courses {
      id
      name
      concepts {
        id
        name
      }
    }
  }
}
`

export {
  IMPORT_DATA
}
