import React from 'react'
import HeaderButton from './HeaderButton'
import ConceptButton from './ConceptButton'

const CourseColumn = ({ course }) => {
  return (
    <div className="curri-column">
      <HeaderButton text={course.name} />
      {course.concepts.map(concept =>
        <ConceptButton
          concept={concept}
          key={concept.name}/>
      )}
      <HeaderButton text='+' />
    </div>
  )
}


export default CourseColumn