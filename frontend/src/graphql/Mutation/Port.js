import { gql } from 'apollo-boost'

const PORT_DATA = gql`
mutation portData($data: String!) {
  portData(data: $data) {
    id
  }
}
`

export {
  PORT_DATA
}
