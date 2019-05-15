import React, { useState } from 'react'

const CourseForm = ({ createCourse }) => {
  const [name, setName] = useState('')

  const submit = async (event) => {
    event.preventDefault()

    if (name === '') {
      alert('Course needs a name!')
      return
    }

    await createCourse({
      variables: { name }
    })
    setName('')
  }

  return (
    <form onSubmit={submit}>
      <div className="course-input-column">
        <div className="input-label">
          <label htmlFor="name"> Name </label>
        </div>
        <input className="course-input" value={name} onChange={(e) => setName(e.target.value)}></input>
        <button className="input-button" type="submit"> create course </button>
      </div>
    </form>
  )

}

export default CourseForm