import React from 'react'
import HeaderButton from './HeaderButton'
import ConceptButton from './ConceptButton'


const ActiveCourse = ({ course }) => {
  console.log(course)
  return (
    <div className="left-menu">
      <HeaderButton text={course.name} />

      <div className="left-menu-scroll">


        <div className="left-menu-concepts">
          {course.concepts.map(concept =>
            <ConceptButton
              concept={concept}
              key={concept.name}/>
          )}
        </div>

      </div>
      <HeaderButton text='+' />


    </div>
  )
}

export default ActiveCourse