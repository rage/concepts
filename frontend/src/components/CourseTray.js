import React from 'react'

const CourseTray = ({ courses, onClick }) => (
  <div className="right-menu">
    <div className="right-menu-scroll">
      <div className="right-menu-courses">


        {
          courses.map(course => (<button
            key={course.name}
            onClick={onClick}
            className="curri-button"
            style={{ margin: '1vh', backgroundColor: '#ffffff' }}>
            {course.name}
          </button>))
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


export default CourseTray