import React, { useState } from 'react'

import { useQuery } from 'react-apollo-hooks'
import { ALL_COURSES, COURSE_AND_CONCEPTS } from '../services/CourseService'

import CourseContainer from './CourseContainer'
import CourseTray from './CourseTray'
import ActiveCourse from './ActiveCourse'

const CourseView = ({ course_id }) => {
  const [activeConceptId, setActiveConceptId] = useState('')

  const courses = useQuery(ALL_COURSES)

  const { data, loading } = useQuery(COURSE_AND_CONCEPTS, {
    variables: { id: course_id }
  })

  const activateConcept = (id) => () => {
    const alreadyActive = activeConceptId === id
    setActiveConceptId(alreadyActive ? '' : id)
    console.log(activeConceptId)
  }

  return (
    <div>
      {
        data.courseById && courses.data.allCourses ?
          <div className="course-view">
            <ActiveCourse
              course={data.courseById}
              activeConceptId={activeConceptId}
              activateConcept={activateConcept}
            />
            <CourseContainer
              courses={courses.data.allCourses.filter(course =>
                course.id !== course_id
              )}
              activeConceptId={activeConceptId}
            />
            <CourseTray courses={courses.data.allCourses} course_id={course_id}/>
          </div> :
          null
      }
    </div>
  )
}

export default CourseView