import { gql } from 'apollo-boost'

const PORT_DATA = gql`
mutation portData($data: String!) {
  portData(data: $data) {
    id
    name
    owner {
      id
    }
  }
}
`

export {
  PORT_DATA
}
