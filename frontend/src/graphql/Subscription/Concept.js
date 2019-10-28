import gql from 'graphql-tag'

const CONCEPT_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  conceptCreated(workspaceId:$workspaceId) {
    id
    name
    description
    official
    frozen
    tags {
      id
      name
      type
      priority
    }
    course {
      id
    }
    linksFromConcept {
      id
      official
      frozen
      to {
        id
      }
    }
    linksToConcept {
      id
      official
      frozen
      from {
        id
      }
    }
  }
}
`

const CONCEPT_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  conceptUpdated(workspaceId:$workspaceId) {
    id
    name
    description
    official
    frozen
    tags {
      id
      name
      type
      priority
    }
    course {
      id
    }
  }
}
`

const CONCEPT_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  conceptDeleted(workspaceId:$workspaceId) {
    id
    courseId
  }
}
`

export {
  CONCEPT_CREATED_SUBSCRIPTION,
  CONCEPT_DELETED_SUBSCRIPTION,
  CONCEPT_UPDATED_SUBSCRIPTION
}
