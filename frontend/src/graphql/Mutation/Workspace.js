import { gql } from 'apollo-boost'

const CREATE_WORKSPACE = gql`
mutation createWorkspace($name: String!, $projectId: ID) {
  createWorkspace(name: $name, projectId: $projectId) {
    id
    name
  }
}
`

const UPDATE_WORKSPACE = gql`
mutation updateWorkspace($id: ID!, $name: String!) {
  updateWorkspace(id: $id, name: $name) {
    id
    name
  }
}
`

const DELETE_WORKSPACE = gql`
mutation deleteWorkspace($id: ID!) {
  deleteWorkspace(id: $id) {
    id
  }
}
`

const ADD_DEFAULT_COURSE = gql`
mutation addDefaultCourseForWorkspace($courseId: ID!, $workspaceId: ID!) {
  addDefaultCourseForWorkspace(courseId: $courseId, workspaceId: $workspaceId) {
    id
    name
    defaultCourse {
      id
    }
    owner {
      id
    }
  }
}
`

export {
  CREATE_WORKSPACE,
  UPDATE_WORKSPACE,
  DELETE_WORKSPACE,
  ADD_DEFAULT_COURSE
}
