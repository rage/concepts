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

const FETCH_COURSE_AND_PREREQUISITES = gql`
query courseAndPrerequisites($courseId: ID!, $workspaceId: ID!) {
  courseAndPrerequisites(courseId: $courseId, workspaceId: $workspaceId) {
    id
    name
    concepts {
      id
      name
      linksToConcept {
        id
        from {
          id
        }
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
            id
            official
            to {
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
  FETCH_WORKSPACE_AND_DEFAULT_DATA,
  FETCH_COURSE_AND_PREREQUISITES
}