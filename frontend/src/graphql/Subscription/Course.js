import gql from 'graphql-tag'

const COURSE_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseCreated(workspaceId:$workspaceId) {
    id
    name
    official
    frozen
    tags {
      id
      name
      type
      priority
    }
    linksToCourse {
      from {
        id
      }
    }
    conceptOrder
    concepts {
      id
      name
      description
      official
      frozen
      course {
        id
      }
      linksToConcept {
        from {
          id
          name
          course {
            id
          }
        }
      }
    }
  }
}
`

const COURSE_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  courseUpdated(workspaceId:$workspaceId) {
    id
    name
    official
    frozen
    conceptOrder
    tags {
      id
      name
      type
      priority
    }
  }
}
`

const COURSE_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  courseDeleted(workspaceId:$workspaceId) {
    id
  }
}
`

export {
  COURSE_CREATED_SUBSCRIPTION,
  COURSE_DELETED_SUBSCRIPTION,
  COURSE_UPDATED_SUBSCRIPTION
}
