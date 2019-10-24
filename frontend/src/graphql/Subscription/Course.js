import gql from 'graphql-tag'

const COURSE_CREATED_SUBSCRIPTION = gql`
subscription {
  courseCreated {
    id
    name
  }
}
`

const COURSE_DELETED_SUBSCRIPTION = gql`
subscription {
  courseDeleted {
    id
    name
  }
}
`

export {
  COURSE_CREATED_SUBSCRIPTION,
  COURSE_DELETED_SUBSCRIPTION
}
