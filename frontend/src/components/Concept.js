import React from 'react'


const Concept = ({concept, onDelete}) => (
    <tr style={{textAlign:'left'}}>
        <td> {concept.id} </td>
        <td> {concept.name} </td>
        <td> {concept.description} </td>
        <td> {concept.official ? 'official' : 'unofficial'} </td>
        <td> <button onClick={onDelete(concept.id)}> Delete </button></td>
    </tr>
)

export default Concept