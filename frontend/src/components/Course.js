import React from 'react'
import { Link } from 'react-router-dom'

const Course = ({ course }) => (
  <tr>
    <td> {course.id}</td>
    <td> <Link to={`/courses/${course.id}`}>{course.name}</Link> </td>
  </tr>
)

export default Course