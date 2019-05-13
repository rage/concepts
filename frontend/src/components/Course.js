import React from 'react'

const Course = ({ course }) => (
  <tr>
    <td> {course.id }</td>
    <td> {course.name} </td>
  </tr>
)

export default Course