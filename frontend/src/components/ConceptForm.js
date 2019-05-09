import React, { useState } from 'react'

const ConceptForm = ({createConcept}) => {
    const [name, setName] = useState('')

    const submit = async (event) => {
        event.preventDefault()
        await createConcept({
            variables: { name }
        })
        setName('')
    }

    return (
        <form onSubmit={submit}>
            <label> Name: </label>
            <input value={name} onChange={(e) => setName(e.target.value)}/>
            <button type="submit"> Create concept </button>
        </form>
    )
}

export default ConceptForm