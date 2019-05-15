import React from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

const AltCourse = (props) => {
  return (
    <button
      className="course-button"
      style={{ backgroundColor: '#e8e8e8' }}>
      <Link style={{ textDecoration: 'none' }} to={`/courses/${props.id}`}>{props.text}</Link>
    </button>
  )
}

export default AltCourse