import { gql } from 'apollo-boost'

const CREATE_COURSE = gql`
mutation createCourse($name: String!, $workspaceId: ID!, $official: Boolean) {
  createCourse(name: $name, workspaceId: $workspaceId, official: $official) {
    id
    name
    official
    linksToCourse {
      from {
        id
      }
    }
    concepts {
      id
      name
      description
      official
      courses {
        id
      }
      linksToConcept {
        from {
          id
          name
          courses {
            id
          }
        }
      }
    }
  }
}
`

const UPDATE_COURSE = gql`
mutation updateCourse($id: ID!, $name: String!, $official: Boolean) {
  updateCourse(id: $id, name: $name, official: $official) {
    id
    name
    official
    linksToCourse {
      from {
        id
      }
    }
    concepts {
      id
      name
      description
      official
      courses {
        id
      }
      linksToConcept {
        from {
          id
          name
          courses {
            id
          }
        }
      }
    }
  }
}
`

const DELETE_COURSE = gql`
mutation deleteCourse($id: ID!) {
  deleteCourse(id: $id) {
    id
  }
}
`

export {
  CREATE_COURSE,
  UPDATE_COURSE,
  DELETE_COURSE
}
