import React from 'react'
import { Link } from 'react-router-dom'

const CourseLink = ({ course }) => (
  <tr>
    <td> {course.id}</td>
    <td> <Link to={`/courses/${course.id}`}>{course.name}</Link> </td>
  </tr>
)

export default CourseLink