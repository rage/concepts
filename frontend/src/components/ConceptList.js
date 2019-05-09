import React from 'react'
import Concept from '../components/Concept'


const ConceptList = ({concepts}) => {
    return (
        <table style={{textAlign:'left'}}>
            <thead>
                <tr>
                    <th>
                        Id
                    </th>
                    <th>
                        Name
                    </th>
                </tr>
                    
            </thead>
            <tbody>
                {
                    concepts.map(concept => <Concept concept={concept}/>)
                }
            </tbody>
        </table>
    )
}

export default ConceptList