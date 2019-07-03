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

const COURSES_BY_WORKSPACE = gql`
query coursesByWorkspace($workspaceId: ID!) {
  coursesByWorkspace(workspaceId: $workspaceId) {
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
      description
      official
      linksFromConcept {
        id
        official
        to {
          id
        }
      }
      linksToConcept {
        id
        official
        from {
          id
        }
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
          official
          linksFromConcept {
            id
            official
            to {
              id
            }
          }
          linksToConcept {
            id
            official
            from {
              id
            }
          }
        }
      }
    }
  }
}
`

const COURSE_BY_ID = gql`
query courseById($id: ID!) {
  courseById(id: $id) {
    id
    name
    concepts {
      id
      name
      description
      official
      courses {
          id
      }
      linksFromConcept {
        id
        official
        to {
          id
        }
      }
      linksToConcept {
        id
        official
        from {
          id
        }
      }
    }
  }
}
`

const COURSE_PREREQUISITES = gql`
query courseAndPrerequisites($courseId: ID!, $workspaceId: ID!) {
  courseAndPrerequisites(courseId: $courseId, workspaceId: $workspaceId) {
    id
    name
    linksToCourse {
      id
      from {
        id
        name
        concepts {
          id
          name
          description
          official
          linksFromConcept {
            id
            official
            to {
              id
            }
          }
          linksToConcept {
            id
            official
            from {
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
  FETCH_COURSE_AND_PREREQUISITES,
  COURSES_BY_WORKSPACE,
  COURSE_BY_ID,
  COURSE_PREREQUISITES
}
