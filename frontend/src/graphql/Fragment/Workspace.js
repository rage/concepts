import gql from 'graphql-tag'

const COURSES_FOR_WORKSPACE_FRAGMENT = gql`
fragment coursesForWorkspace on Workspace {
  id
  courseOrder
  courses {
    id
    name
    linksToCourse {
      from {
        id
      }
    }
    conceptOrder
    objectiveOrder
    concepts {
      id
      name
      description
      level
      position
      course {
        id
      }
      tags {
        id
        name
      }
      linksToConcept {
        id
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

export {
  COURSES_FOR_WORKSPACE_FRAGMENT
}
