import { gql } from 'apollo-boost'

const PORT_DATA = gql`
mutation portData($data: String!) {
  portData(data: $data) {
    id
    name
    owner {
      id
    }
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
  PORT_DATA
}
