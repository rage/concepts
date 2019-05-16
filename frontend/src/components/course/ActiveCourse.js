import React from 'react'
import HeaderButton from './HeaderButton'
import ActivatableConcept from '../concept/ActivatableConcept'


const ActiveCourse = ({ course, activateConcept, activeConceptId }) => {
  return (
    <div className="left-menu">
      <HeaderButton text={course.name} />

      <div className="left-menu-scroll">
        <div className="left-menu-concepts">
          {course.concepts.map(concept =>
            <ActivatableConcept
              concept={concept}
              key={concept.id}
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