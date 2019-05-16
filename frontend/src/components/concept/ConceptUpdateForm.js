import React, { useState } from 'react'

const ConceptUpdateForm = ({ updateConcept, concept, closeModal }) => {
  const [name, setName] = useState(concept.name)
  const [description, setDescription] = useState(concept.description ? concept.description : '')

  const submit = async (event) => {
    event.preventDefault()
    // console.log('course_id', course_id)
    let variables = { id: concept.id }
    if (concept.name !== name) {
      variables.name = name
    }
    if (concept.description !== description) {
      variables.description = description
    }
    await updateConcept({
      variables
    })
    setName('')
    setDescription('')
    closeModal()
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label> Name </label>
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label> Description  </label>
        <input name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <button type="submit"> Save </button>
    </form>
  )
}

export default ConceptUpdateForm