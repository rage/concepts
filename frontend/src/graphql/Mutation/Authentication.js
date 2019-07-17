import { gql } from 'apollo-boost'

const CREATE_GUEST_ACCOUNT = gql`
mutation createGuest {
  createGuest {
    token
    user {
      id,
      role
      guideProgress
    }
  }
}
`

export {
  CREATE_GUEST_ACCOUNT
}
