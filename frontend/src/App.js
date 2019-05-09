import React from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'

import ConceptList from './components/ConceptList'
import ConceptForm from './components/ConceptForm'
import {ALL_CONCEPTS, DELETE_CONCEPT, CREATE_CONCEPT, ADD_PREREQUISITE_CONCEPT} from './services/ConceptService'

import './App.css'

const App = (props) => {
  const allConcepts = useQuery(ALL_CONCEPTS)

  const addPrerequisiteToConcept = useMutation(ADD_PREREQUISITE_CONCEPT, {
    refetchQueries: [{ query: ALL_CONCEPTS }]
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    refetchQueries: [{ query: ALL_CONCEPTS }]
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    refetchQueries: [{ query: ALL_CONCEPTS }]
  })

  return (
    <div className="App">
      <ConceptList deleteConcept={deleteConcept} concepts={allConcepts} addPrerequisiteToConcept={addPrerequisiteToConcept}/><br/>
      <ConceptForm createConcept={createConcept}/>
    </div>
  )
}

export default App;
