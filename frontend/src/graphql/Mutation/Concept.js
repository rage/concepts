import { gql } from 'apollo-boost'

const UPDATE_CONCEPT = gql`
mutation updateConcept($id: ID!, $name:String, $description: String, $official: Boolean, $tags: String) {
  updateConcept(id:$id, name:$name, description:$description, official: $official, tags: $tags) {
    id
    name
    description
    official
    tags
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
                       $courseId:ID, $tags:String) {
  createConcept(name:$name, description:$description, official:$official, workspaceId: $workspaceId,
                courseId:$courseId, tags:$tags) {
    __typename
    id
    name
    description
    official
    tags
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
