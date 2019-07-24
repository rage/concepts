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

const CREATE_TEMPLATE_WORKSPACE = gql`
mutation createTemplateWorkspace($projectId: ID!) {
  createTemplateWorkspace(projectId: $projectId) {
    id
    name
    courses {
      id
    }
    concepts {
      id
    }
    courseLinks {
      id
    }
    conceptLinks {
      id
    }
  }
}
`

const UPDATE_TEMPLATE_WORKSPACE = gql`
mutation updateTemplateWorkspace($id: ID!, $name: String) {
  updateTemplateWorkspace(id: $id, name: $name) {
    id
    name
  }
}
`

const DELETE_TEMPLATE_WORKSPACE = gql`
mutation deleteTemplateWorkspace($id: ID!) {
  deleteTemplateWorkspace(id: $id) {
    id
  }
}
`

export {
  CREATE_WORKSPACE,
  UPDATE_WORKSPACE,
  DELETE_WORKSPACE,
  CREATE_TEMPLATE_WORKSPACE,
  UPDATE_TEMPLATE_WORKSPACE,
  DELETE_TEMPLATE_WORKSPACE
}
