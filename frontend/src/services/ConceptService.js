import { gql } from 'apollo-boost'

const ALL_CONCEPTS = gql`
{
    allConcepts{
        id
        name
        description
        official
        linksToConcept {
            from{
                id
                name
                description
                official
            }
        }
    }
}
`

const ADD_PREREQUISITE_CONCEPT = gql`
mutation createConceptAndLinkTo($name: String!, $description: String!, $to:ID!) {
  createConceptAndLinkTo(name: $name, desc: $description, to:$to) {
    id
    to {
      id
      name
    }
    from {
      id
      name
    }
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

export { ALL_CONCEPTS, CREATE_CONCEPT, DELETE_CONCEPT, ADD_PREREQUISITE_CONCEPT }