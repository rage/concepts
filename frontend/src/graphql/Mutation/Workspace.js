import { gql } from 'apollo-boost'

const CREATE_WORKSPACE = gql`
mutation createWorkspace($name: String!, $projectId: ID!) {
  createWorkspace(name: $name, projectId: $projectId) {
    id
    name
  }
}
`

const CREATE_GUEST_WORKSPACE = gql`
mutation createGuestWorkspace($name: String!) {
  createGuestWorkspace(name: $name) {
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

export {
  CREATE_WORKSPACE,
  UPDATE_WORKSPACE,
  DELETE_WORKSPACE,
  CREATE_GUEST_WORKSPACE
}