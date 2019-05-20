import React from 'react'
import Course from './Course'
import MaterialCourse from './MaterialCourse'

const CourseContainer = ({ courses, linkPrerequisite, activeConceptId, deleteLink, createConcept }) => (
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
        />
      )
    }
  </div>
)

export default CourseContainer