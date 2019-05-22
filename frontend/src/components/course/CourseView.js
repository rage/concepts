import React, { useState } from 'react'

import { useQuery, useMutation } from 'react-apollo-hooks'
import {
  LINK_PREREQUISITE,
  DELETE_LINK,
  CREATE_CONCEPT,
  DELETE_CONCEPT
} from '../../services/ConceptService'

import {
  ALL_COURSES,
  FETCH_COURSE,
  ADD_COURSE_AS_PREREQUISITE,
  COURSE_PREREQUISITE_COURSES
} from '../../services/CourseService'

import CourseContainer from './CourseContainer'
import MaterialCourseTray from './MaterialCourseTray'
import MaterialActiveCourse from './MaterialActiveCourse'

const CourseView = ({ course_id, createCourse, updateCourse, courses }) => {
  const [activeConceptId, setActiveConceptId] = useState('')

  const course = useQuery(FETCH_COURSE, {
    variables: { id: course_id }
  })

  const prerequisites = useQuery(COURSE_PREREQUISITE_COURSES, {
    variables: { id: course_id }
  })

  const linkPrerequisite = useMutation(LINK_PREREQUISITE, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const deleteLink = useMutation(DELETE_LINK, {
    refetchQueries: [{ query: ALL_COURSES }]
  })

  const addCourseAsPrerequisite = useMutation(ADD_COURSE_AS_PREREQUISITE, {
    refetchQueries: [{
      query: COURSE_PREREQUISITE_COURSES,
      variables: { id: course_id }
    }]
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    refetchQueries: [{
      query: ALL_COURSES
    }]
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    refetchQueries: { query: FETCH_COURSE, variables: { id: course.id } }
  })

  const activateConcept = (id) => () => {
    const alreadyActive = activeConceptId === id
    setActiveConceptId(alreadyActive ? '' : id)
    console.log(activeConceptId)
  }

  return (
    <React.Fragment>
      {
        course.data.courseById && courses.data.allCourses && prerequisites.data.courseById ?
          <div className="course-view">
            <MaterialCourseTray
              courses={courses.data.allCourses}
              activeCourse={course_id}
              addCourseAsPrerequisite={addCourseAsPrerequisite}
              prerequisiteCourses={prerequisites.data.courseById.prerequisiteCourses.filter(course =>
                course.id !== course_id
              )}
              createCourse={createCourse}
            />
            <CourseContainer
              courses={prerequisites.data.courseById.prerequisiteCourses.filter(course =>
                course.id !== course_id
              )}
              linkPrerequisite={linkPrerequisite}
              deleteLink={deleteLink}
              activeConceptId={activeConceptId}
              createConcept={createConcept}
              deleteConcept={deleteConcept}
              updateCourse={updateCourse}
            />
            <MaterialActiveCourse
              course={course.data.courseById}
              activeConceptId={activeConceptId}
              activateConcept={activateConcept}
              createConcept={createConcept}
              deleteConcept={deleteConcept}
            />
          </div> :
          null
      }
    </React.Fragment>
  )
}

export default CourseView