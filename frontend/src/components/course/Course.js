import React from 'react'
import HeaderButton from './HeaderButton'
import ConceptButton from '../concept/ConceptButton'

const CourseColumn = ({ course, linkPrerequisite, activeConceptId, deleteLink }) => {
  return (
    <div className="curri-column">
      <HeaderButton text={course.name} />
      {course.concepts.map(concept =>
        <ConceptButton
          concept={concept}
          key={concept.id}
          linkPrerequisite={linkPrerequisite}
          deleteLink={deleteLink}
          activeConceptId={activeConceptId}
        />
      )}
      <HeaderButton text='+' />
    </div>
  )
}


export default CourseColumn