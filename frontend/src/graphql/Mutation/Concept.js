import gql from 'graphql-tag'

const UPDATE_CONCEPT = gql`
mutation updateConcept($id: ID!, $name:String, $description: String, $official: Boolean, 
                       $frozen: Boolean, $tags: [TagInput!]) {
  updateConcept(id: $id, name: $name, description: $description, 
                official: $official, frozen: $frozen,  tags: $tags) {
    id
    name
    description
    official
    frozen
    tags {
      id
      name
      type
      priority
    }
    course {
      id
    }
  }
}
`

const CREATE_CONCEPT = gql`
mutation createConcept($name: String!, $description: String!, $official: Boolean, $frozen: Boolean,
                       $workspaceId: ID!, $courseId: ID, $tags: [TagInput!]) {
  createConcept(name: $name, description: $description, official: $official, frozen: $frozen,
                workspaceId: $workspaceId, courseId: $courseId, tags:$tags) {
    id
    name
    description
    official
    frozen
    tags {
      id
      name
      type
      priority
    }
    course {
      id
    }
    linksFromConcept {
      id
      official
      frozen
      to {
        id
      }
    }
    linksToConcept {
      id
      official
      frozen
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
