import { gql } from 'apollo-boost'

const UPDATE_CONCEPT = gql`
mutation updateConcept($id: ID!, $name:String, $description: String) {
  updateConcept(id:$id, name:$name, desc:$description) {
    id
    name
    description
    official
  }
}
`

const ALL_CONCEPTS = gql`
{
    allConcepts{
        id
        name
        description
        official
        linksToConcept {
            from {
                id
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
mutation createConcept($name: String!, $description:String!, $official:Boolean!, $course_id:ID!) {
  createConcept(name:$name, desc:$description, official:$official, course_id:$course_id) {
    id
    name
    description
    official
    linksFromConcept {
      id
      to {
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
    name
  }
}
`

const LINK_PREREQUISITE = gql`
mutation createLink($to: ID!, $from: ID!) {
  createLink(to:$to, from:$from) {
    id
    to {
      id
    }
    from {
      id
    }
  }
}
`

const DELETE_LINK = gql`
mutation deleteLink($id: ID!) {
  deleteLink(id: $id) {
    id
  }
}
`

export {
  ALL_CONCEPTS,
  CREATE_CONCEPT,
  DELETE_CONCEPT,
  ADD_PREREQUISITE_CONCEPT,
  UPDATE_CONCEPT,
  LINK_PREREQUISITE,
  DELETE_LINK
}