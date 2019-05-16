import React from 'react'

const ActivatableConcept = ({ concept, activateConcept, activeConceptId }) => {

  const buttonStyle = () => {
    return {
      backgroundColor: activeConceptId === concept.id ? '#9ecae1' : '#ffffff'
    }
  }

  return (
    <button
      onClick={activateConcept(concept.id)}
      className="curri-button"
      style={buttonStyle()}>
      {concept.name}
    </button>
  )
}


export default ActivatableConcept