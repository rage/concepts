import React from 'react'



const Concept = ({concept}) => (
    <tr id={concept.id} style={{textAlign:'left'}}>
        <td> {concept.id} </td>
        <td> {concept.name} </td>

    </tr>
)

export default Concept