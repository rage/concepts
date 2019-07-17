import { gql } from 'apollo-boost'

const UPDATE_USER = gql`
mutation updateUser($id: ID!, $guideProgress: Int!) {
  updateUser(id: $id, guideProgress: $guideProgress) {
    id
    role
    guideProgress
  }
}
`

export {
  UPDATE_USER
}
