import { gql } from 'apollo-boost'

const UPDATE_CONCEPT = gql`
mutation updateConcept($id: ID!, $name:String, $description: String, $official: Boolean) {
  updateConcept(id:$id, name:$name, description:$description, official: $official) {
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
`

const CREATE_CONCEPT = gql`
mutation createConcept($name: String!, $description:String!, $official:Boolean!, $workspaceId:ID!,
                       $courseId:ID) {
  createConcept(name:$name, description:$description, official:$official, workspaceId: $workspaceId,
                courseId:$courseId) {
    __typename
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
`

const DELETE_CONCEPT = gql`
mutation deleteConcept($id: ID!) {
  deleteConcept(id: $id) {
    id
    courseId
  }
}
`

export {
  CREATE_CONCEPT,
  DELETE_CONCEPT,
  UPDATE_CONCEPT
}
