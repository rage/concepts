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
      <label htmlFor="name"> Name </label>
      <input value={name} onChange={(e) => setName(e.target.value)}></input>
      <button type="submit"> create course </button>
    </form>
  )

}

export default CourseForm