import React from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'

import ConceptList from './components/ConceptList'
import ConceptForm from './components/ConceptForm'
import {ALL_CONCEPTS, DELETE_CONCEPT, CREATE_CONCEPT} from './services/ConceptService'

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
