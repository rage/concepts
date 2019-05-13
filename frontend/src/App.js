import React from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'

import ConceptList from './components/ConceptList'
import ConceptForm from './components/ConceptForm'
import CourseList from './components/CourseList'
import CourseForm from './components/CourseForm'

import { ALL_CONCEPTS, DELETE_CONCEPT, CREATE_CONCEPT, ADD_PREREQUISITE_CONCEPT } from './services/ConceptService'
import { ALL_COURSES, CREATE_COURSE } from './services/CourseService'

import './App.css'

const App = () => {
  const allConcepts = useQuery(ALL_CONCEPTS)
  const allCourses = useQuery(ALL_COURSES)

  const createCourse = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

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
      <ConceptList deleteConcept={deleteConcept} concepts={allConcepts} addPrerequisiteToConcept={addPrerequisiteToConcept} /><br />
      <ConceptForm createConcept={createConcept} />
      <CourseList courses={allCourses}/>
      <CourseForm createCourse={createCourse} />
    </div>
  )
}

export default App
