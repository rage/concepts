import { gql } from 'apollo-boost'

const CREATE_COURSE_LINK = gql`
mutation createCourseLink($to: ID!, $from: ID!, $workspaceId: ID!, $official: Boolean) {
  createCourseLink(to:$to, from:$from, workspaceId: $workspaceId, official: $official) {
    id
    official
    from {
      id
      name
      concepts {
        id
        name
        description
        linksFromConcept {
          official
          id
          to {
              id
            }
        }
      }
    }
  }
}
`

const DELETE_COURSE_LINK = gql`
mutation deleteCourseLink($id: ID!) {
  deleteCourseLink(id: $id) {
    id
  }
}
`

export {
  CREATE_COURSE_LINK,
  DELETE_COURSE_LINK
}