import React, { useState } from 'react'
import MaterialCourse from './MaterialCourse'

import { useMutation } from 'react-apollo-hooks'
import { ALL_COURSES} from '../../services/CourseService'
import { UPDATE_CONCEPT } from '../../services/ConceptService'

import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'
import ConceptEditingDialog from '../concept/ConceptEditingDialog'
import CourseEditingDialog from './CourseEditingDialog'

const CourseContainer = ({ courses, linkPrerequisite, activeConceptId, deleteLink, createConcept, deleteConcept, updateCourse }) => {
  const [courseState, setCourseState] = useState({ open: false, id: '', name: '' })
  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({ open: false, id: '', name: '', description: '' })

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const handleCourseClose = () => {
    setCourseState({ open: false, id: '' })
  }

  const handleCourseOpen = (id, name) => () => {
    setCourseState({ open: true, id, name })
  }

  const handleConceptClose = () => {
    setConceptState({ open: false, id: '' })
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