import React from 'react'
import Concept from '../components/Concept'


const ConceptList = ({concepts, deleteConcept, addPrerequisiteToConcept}) => {

    const onDelete = (id) => async () => {
        await deleteConcept({
            variables: {id}
        })        
    }

    const tableStyle = {
        border: '1px solid black',
        width: '100%'
    }

    return (
        <div>
        {
            concepts.loading ?
                <div> Loading concepts... </div> :
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th>
                                Prerequisites
                            </th>
                            <th>
                                Concept
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            concepts.data.allConcepts ? 
                                concepts.data.allConcepts.map(concept => <Concept onDelete={onDelete} key={concept.id} concept={concept} onConnect={addPrerequisiteToConcept}/>) : 
                                null
                        }
                    </tbody>
                </table>        
        }
        
        </div>
    )
}

export default ConceptList