import { gql } from 'apollo-boost'

const ALL_CONCEPTS = gql`
{
  allConcepts {
    id
    name
    description
    official
  }
}
`

const CREATE_CONCEPT = gql`
mutation createConcept($name: String!, $description:String!, $official:Boolean!) {
  createConcept(name:$name, desc:$description, official:$official) {
    id
    name
    description
    official
  }
}
`

const DELETE_CONCEPT = gql`
mutation deleteConcept($id: ID!) {
  deleteConcept(id: $id) {
    id name
  }
}
`

export {ALL_CONCEPTS, CREATE_CONCEPT, DELETE_CONCEPT}