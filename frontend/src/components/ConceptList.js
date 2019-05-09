import React from 'react'
import Concept from '../components/Concept'


const ConceptList = ({concepts, deleteConcept}) => {

    const onDelete = (id) => async () => {
        await deleteConcept({
            variables: {id}
        })
        
    }

    return (
        <div>
        {
            concepts.loading ?
                <div> </div> :
                <table style={{textAlign:'left'}}>
                <thead>
                    <tr>
                        <th>
                            Id
                        </th>
                        <th>
                            Name
                        </th>
                        <th>
                            Description
                        </th>
                        <th>
                            Official
                        </th>
                        <th>
                            Delete
                        </th>
                    </tr>
                        
                </thead>
                <tbody>
                    {
                        concepts.data.allConcepts ? 
                            concepts.data.allConcepts.map(concept => <Concept onDelete={onDelete} key={concept.id} concept={concept}/>) : 
                            null
                    }
                </tbody>
            </table>        
        }
        
        </div>
    )
}

export default ConceptList