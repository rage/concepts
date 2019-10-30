import gql from 'graphql-tag'

const CREATE_COURSE_LINK = gql`
mutation createCourseLink($to: ID!, $from: ID!, $workspaceId: ID!, $official: Boolean) {
  createCourseLink(to:$to, from:$from, workspaceId: $workspaceId, official: $official) {
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

const UPDATE_COURSE_LINK = gql`
mutation updateCourseLink($id: ID!, $frozen: Boolean, $official: Boolean) {
  updateCourseLink(id: $id, official: $official, frozen: $frozen) {
    id
    official
    frozen
    to {
      id
    }
  }
} 
`

const DELETE_COURSE_LINK = gql`
mutation deleteCourseLink($id: ID!) {
  deleteCourseLink(id: $id) {
    id
    courseId
  }
}
`

export {
  CREATE_COURSE_LINK,
  DELETE_COURSE_LINK,
  UPDATE_COURSE_LINK
}
