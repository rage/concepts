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

const WORKSPACE_CONCEPTS_FRAGMENT = gql`
fragment workspaceConcepts on Workspace {
  id
  courses {
    id
    name
    concepts {
      id
      name
      linksToConcept {
        from { id }
      }
    }
  }
}
`

export {
  WORKSPACE_CONCEPTS_FRAGMENT,
  COURSES_FOR_WORKSPACE_FRAGMENT
}
