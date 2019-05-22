import React, { useState } from 'react'
import MaterialCourse from './MaterialCourse'

import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { ALL_COURSES, FETCH_COURSE } from '../../services/CourseService'
import { UPDATE_CONCEPT, CREATE_CONCEPT } from '../../services/ConceptService'
import { COURSE_PREREQUISITE_COURSES } from '../../services/CourseService'

import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'
import ConceptEditingDialog from '../concept/ConceptEditingDialog'
import CourseEditingDialog from './CourseEditingDialog'

const CourseContainer = ({ courses, linkPrerequisite, activeConceptId, deleteLink, deleteConcept, updateCourse, course_id }) => {
  const [courseState, setCourseState] = useState({ open: false, id: '', name: '' })
  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({ open: false, id: '', name: '', description: '' })

  console.log(course_id)
  const client = useApolloClient()

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES, variables: { id: course_id } })
      const addedConcept = response.data.createConcept
      const dataInStoreCopy = { ...dataInStore }
      const course = dataInStoreCopy.courseById.prerequisiteCourses.find(c => c.id === conceptState.id)
      if (!includedIn(course.concepts, addedConcept)) {
        course.concepts.push(addedConcept)
        client.writeQuery({
          query: COURSE_PREREQUISITE_COURSES,
          variables: { id: course_id },
          data: dataInStoreCopy
        })
      }
      setConceptState({ ...conceptState, id: '' })
    }
  })

  const handleCourseClose = () => {
    setCourseState({ open: false, id: '' })
  }

  const handleCourseOpen = (id, name) => () => {
    setCourseState({ open: true, id, name })
  }

  const handleConceptClose = () => {
    setConceptState({ ...conceptState, open: false })
  }

  const handleConceptOpen = (id) => () => {
    setConceptState({ open: true, id })
  }

  const handleConceptEditClose = () => {
    setConceptEditState({ open: false, id: '', name: '', description: '' })
  }

  const handleConceptEditOpen = (id, name, description) => () => {
    setConceptEditState({ open: true, id, name, description })
  }


  return (
    <div className="curri-column-container">
      {
        courses && courses.map(course =>
          <MaterialCourse
            key={course.id}
            course={course}
            linkPrerequisite={linkPrerequisite}
            deleteLink={deleteLink}
            activeConceptId={activeConceptId}
            createConcept={createConcept}
            openCourseDialog={handleCourseOpen}
            openConceptDialog={handleConceptOpen}
            openConceptEditDialog={handleConceptEditOpen}
            deleteConcept={deleteConcept}
          />
        )
      }

      <CourseEditingDialog
        state={courseState}
        handleClose={handleCourseClose}
        updateCourse={updateCourse}
      />
      <ConceptAdditionDialog
        state={conceptState}
        handleClose={handleConceptClose}
        createConcept={createConcept}
      />
      <ConceptEditingDialog
        state={conceptEditState}
        handleClose={handleConceptEditClose}
        updateConcept={updateConcept}
      />
    </div>
  )
}

export default CourseContainer