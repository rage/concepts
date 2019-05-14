import React from 'react'
import HeaderButton from './HeaderButton'
import ToggleButton from './ToggleButton'

const CourseColumn = ({ course }) => {
  return (
    <div className="curri-column">
      <HeaderButton text={course.name} />
      {course.concepts.map(concept =>
        <ToggleButton
          key={concept.name}
          text={concept.name}/>
      )}
      <HeaderButton text='+' />
    </div>
  )
}


export default CourseColumn