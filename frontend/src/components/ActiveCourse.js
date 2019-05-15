import React from 'react'
import HeaderButton from './HeaderButton'
import ActivatableConcept from './ActivatableConcept'


const ActiveCourse = ({ course, activateConcept, activeConceptId }) => {
  console.log(course)
  return (
    <div className="left-menu">
      <HeaderButton text={course.name} />

      <div className="left-menu-scroll">
        <div className="left-menu-concepts">
          {course.concepts.map(concept =>
            <ActivatableConcept
              concept={concept}
              key={concept.name}
              activeConceptId={activeConceptId}
              activateConcept={activateConcept}
            />
          )}
        </div>

      </div>
      <HeaderButton text='+' />


    </div>
  )
}

export default ActiveCourse