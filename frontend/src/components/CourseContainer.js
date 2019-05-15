import React from 'react'
import Course from './Course'

const CourseContainer = ({ courses, linkPrerequisite, activeConceptId, deleteLink }) => (
  <div className="curri-column-container">
    {
      courses && courses.map(course =>
        <Course
          key={course.id}
          course={course}
          linkPrerequisite={linkPrerequisite}
          deleteLink={deleteLink}
          activeConceptId={activeConceptId}
        />
      )
    }
  </div>
)

export default CourseContainer