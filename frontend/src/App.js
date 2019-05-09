import React from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'

import ConceptList from './components/ConceptList'
import ConceptForm from './components/ConceptForm'


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


const App = (props) => {
  const allConcepts = useQuery(ALL_CONCEPTS)
  const createConcept = useMutation(CREATE_CONCEPT, {
    refetchQueries: [{ query: ALL_CONCEPTS }]
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    refetchQueries: [{ query: ALL_CONCEPTS }]
  })

  return (
    <div className="App">
      <ConceptList deleteConcept={deleteConcept} concepts={allConcepts}/>
      <ConceptForm createConcept={createConcept}/>
    </div>
  )
}

export default App;
