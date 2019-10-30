import gql from 'graphql-tag'

const COURSE_LINK_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseLinkCreated(workspaceId: $workspaceId) {
    id
    official
    frozen
    to {
      id
    }
    from {
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
        tags {
          id
          name
          type
          priority
        }
        linksToConcept {
          id
          official
          frozen
          from {
            id
          }
        }
        linksFromConcept {
          id
          official
          frozen
          to {
            id
          }
        }
      }
    }
  }
}
`

const COURSE_LINK_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseLinkUpdated(workspaceId: $workspaceId) {
    id
    official
    frozen
    to {
      id
    }
  }
}
`

const COURSE_LINK_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseLinkDeleted(workspaceId: $workspaceId) {
    id
    to {
      id
    }
  }
}
`

export {
  COURSE_LINK_CREATED_SUBSCRIPTION,
  COURSE_LINK_UPDATED_SUBSCRIPTION,
  COURSE_LINK_DELETED_SUBSCRIPTION
}
