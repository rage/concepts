import gql from 'graphql-tag'

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
    asTemplate {
      id
    }
    tokens {
      id
      privilege
    }
  }
}
`

export {
  IMPORT_DATA
}
