import { gql } from 'apollo-boost'

const CREATE_GUEST_ACCOUNT = gql`
mutation createGuest {
  createGuest {
    token
    user {
      id,
      role
    }
  }
}
`

export {
  CREATE_GUEST_ACCOUNT
}
