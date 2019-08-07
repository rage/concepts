import { gql } from 'apollo-boost'

const CREATE_COURSE = gql`
mutation createCourse($name: String!, $workspaceId: ID!) {
  createCourse(name: $name, workspaceId: $workspaceId) {
    id
    name
    linksToCourse {
      from {
        id
      }
    }
    concepts {
      id
      name
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
mutation updateCourse($id: ID!, $name: String!) {
  updateCourse(id: $id, name: $name) {
    id
    name
    linksToCourse {
      from {
        id
      }
    }
    concepts {
      id
      name
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
