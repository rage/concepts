import { gql } from 'apollo-boost'

const ALL_COURSES = gql`
{
  allCourses {
    id
    name
    concepts {
      id
      name
    }
  }
}
`

const FETCH_WORKSPACE_AND_DEFAULT_DATA = gql`
query workspaceAndData($id: ID!) {
  workspaceById(id: $id) {
    id
    name
    defaultCourse {
      id
      name
      concepts {
        id
        name
        linksToConcept {
          id
          official
        }
      }
      linksToCourse {
        id
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
            }
          }
        }
      }
    }
  }
}
`

export {
  ALL_COURSES,
  FETCH_WORKSPACE_AND_DEFAULT_DATA
}