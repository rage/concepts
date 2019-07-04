import { gql } from 'apollo-boost'

const CREATE_COURSE = gql`
mutation createCourse($name: String!, $workspaceId: ID!) {
  createCourse(name: $name, workspaceId: $workspaceId) {
    id
    name
    concepts {
      id
      name
    }
  }
}
`

const UPDATE_COURSE = gql`
mutation updateCourse($id: ID!, $name: String!) {
  updateCourse(id: $id, name: $name) {
    id
    name
    concepts {
      id
      name
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
