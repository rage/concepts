import { gql } from 'apollo-boost'

const CREATE_PROJECT = gql`
mutation createProject($name: String!) {
  createProject(name: $name) {
    id
    name
  }
}
`

const UPDATE_PROJECT = gql`
mutation updateProject($id: ID!, $name: String!) {
  updateProject(id: $id, name: $name) {
    id
    name
  }
}
`

const DELETE_PROJECT = gql`
mutation deleteProject($id: ID!) {
  deleteProject(id: $id) {
    id
  }
}
`

export {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT
}
