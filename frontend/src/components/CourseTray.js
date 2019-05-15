import React from 'react'

const CourseTray = ({ courses, activeCourse, addCourseAsPrerequisite }) => {
  return (
    <div className="right-menu">
      <div className="right-menu-scroll">
        <div className="right-menu-courses">
          {
            courses.filter(course => course.id !== activeCourse).map(course => {
              return (
                <PrerequisiteCourse
                  key={course.id}
                  course={course}
                  activeCourse={activeCourse}
                  addCourseAsPrerequisite={addCourseAsPrerequisite}
                />
              )
            })
          }
        </div>
      </div>

      <button
        className="curri-button send"
        style={{ backgroundColor: '#e8e8e8' }}
        onClick={() => { alert('Saved to mock-database.') }}>
        Save
      </button>
    </div>
  )
}

const PrerequisiteCourse = ({ course, activeCourse, addCourseAsPrerequisite }) => {
  const onClick = async () => {
    await addCourseAsPrerequisite({
      variables: { id: activeCourse, prerequisite_id: course.id }
    })
  }
  return (
    <button
      onClick={onClick}
      className="curri-button"
      style={{ margin: '1vh', backgroundColor: '#ffffff' }}
    >
      {course.name}
    </button>
  )
}


export default CourseTray