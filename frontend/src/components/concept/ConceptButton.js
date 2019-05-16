import React from 'react'

const ConceptButton = ({ concept, activeConceptId, linkPrerequisite, deleteLink }) => {

  const onClick = async () => {
    console.log(activeConceptId)
    if (activeConceptId === '') return
    const isActive = concept.linksFromConcept.find(link => {
      return link.to.id === activeConceptId
    })
    isActive ?
      await deleteLink({
        variables: { id: isActive.id }
      })
      :
      await linkPrerequisite({
        variables: {
          to: activeConceptId,
          from: concept.id
        }
      })
  }

  const buttonStyle = () => {
    const isActive = concept.linksFromConcept.find(link => {
      return link.to.id === activeConceptId
    })
    return {
      backgroundColor: isActive ? '#9ecae1' : '#ffffff'
    }
  }

  return (
    <button
      onClick={onClick}
      className="curri-button"
      style={buttonStyle()}>
      {concept.name}
    </button>
  )
}


export default ConceptButton