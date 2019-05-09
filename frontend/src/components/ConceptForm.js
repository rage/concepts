import React, { useState } from 'react'

const ConceptForm = ({createConcept}) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [official, setOfficial] = useState(false)

    const submit = async (event) => {
        event.preventDefault()
        await createConcept({
            variables: { name, description, official }
        })
        setName('')
        setDescription('')
        setOfficial(false)
    }

    return (
        <form onSubmit={submit}>
            <div>
                <label> Name </label>
                <input name="name" value={name} onChange={(e) => setName(e.target.value)}/>
            </div>
            
            <div>
                <label> Description  </label>
                <input name="description" value={description} onChange={(e) => setDescription(e.target.value)}/>
            </div>
            
            <div>
                
                <label> Official </label>
                <input type="checkbox" checked={official} onChange={(e) => setOfficial(e.target.checked)}></input>
            </div>
            <button type="submit"> Create concept </button>
        </form>
    )
}

export default ConceptForm