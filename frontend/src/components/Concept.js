import React, { useState } from 'react'

const prerequisiteStyle = {
  padding: '5px'
}

const conceptStyle = {
  padding: '5px'
}

const buttonStyle = {
  width: '100%'
}

const ConnectionForm = ({ concept, onConnect }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visible, setVisible] = useState(false)

  const submit = async (event) => {
    event.preventDefault()

    if (name === '') {
      alert('Name can\'t be empty')
      return
    }
    await onConnect({
      variables: { to: concept.id, name, description }
    })

    setName('')
    setDescription('')
    setVisible(false)
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <div>
      <form onSubmit={submit} style={{ display: visible ? '' : 'none' }}>
        <div>
          <label>
            Name
          </label>
          <input name="name" value={name} onChange={(e) => setName(e.target.value)}></input>
        </div>
        <div>
          <label>
            Description
          </label>
          <input name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit"> Add </button> <button type="button" onClick={toggleVisibility}> Cancel </button>
      </form>
      <button style={{ ...buttonStyle, display: visible ? 'none' : '' }} onClick={toggleVisibility}> + </button>
    </div>
  )
}

const Concept = ({ concept, onConnect }) => (
  <tr style={{ textAlign: 'left' }}>
    <td valign="top" >
      <ConnectionForm concept={concept} onConnect={onConnect} />
      <div style={prerequisiteStyle}>
        {
          concept.linksToConcept.map(link => <div key={link.from.id}> {link.from.name} </div>)
        }
      </div>
    </td>

    <td valign="top" style={conceptStyle}>
      <strong> {concept.name} {concept.official ? '*' : ''} </strong>
      <p> {concept.description} </p>
    </td>


  </tr>
)

export default Concept