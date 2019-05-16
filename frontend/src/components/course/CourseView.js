import React, { useState } from 'react'

import { useQuery, useMutation } from 'react-apollo-hooks'
import { LINK_PREREQUISITE, DELETE_LINK } from '../../services/ConceptService'
import {
  ALL_COURSES,
  FETCH_COURSE,
  ADD_COURSE_AS_PREREQUISITE,
  COURSE_PREREQUISITE_COURSES
} from '../../services/CourseService'

import CourseContainer from './CourseContainer'
import CourseTray from './CourseTray'
import ActiveCourse from './ActiveCourse'

const CourseView = ({ course_id }) => {
  const [activeConceptId, setActiveConceptId] = useState('')

  const courses = useQuery(ALL_COURSES)

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

  const activateConcept = (id) => () => {
    const alreadyActive = activeConceptId === id
    setActiveConceptId(alreadyActive ? '' : id)
    console.log(activeConceptId)
  }

  return (
    <div>
      {
        course.data.courseById && courses.data.allCourses && prerequisites.data.courseById ?
          <div className="course-view">
            <ActiveCourse
              course={course.data.courseById}
              activeConceptId={activeConceptId}
              activateConcept={activateConcept}
            />
            <CourseContainer
              courses={prerequisites.data.courseById.prerequisiteCourses.filter(course =>
                course.id !== course_id
              )}
              linkPrerequisite={linkPrerequisite}
              deleteLink={deleteLink}
              activeConceptId={activeConceptId}
            />
            <CourseTray
              courses={courses.data.allCourses}
              activeCourse={course_id}
              addCourseAsPrerequisite={addCourseAsPrerequisite}
            />
          </div> :
          null
      }
    </div>
  )
}

export default CourseView