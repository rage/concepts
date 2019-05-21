import React, { useState } from 'react'
import Modal from 'react-modal'

import { useMutation } from 'react-apollo-hooks'

import ConceptUpdateForm from './ConceptUpdateForm'

import {
  UPDATE_CONCEPT
} from '../../services/ConceptService'

const customStyles = {
  content: {
    top: '42%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
}

const ConceptButton = ({ concept, activeConceptId, linkPrerequisite, deleteLink }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = () => {
    if (activeConceptId !== '') return
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    variables: { id: concept.id }
  })

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
      backgroundColor: isActive ? '#c5cae9' : '#ffffff'
    }
  }

  return (
    <React.Fragment>
      <button
        onClick={onClick}
        onDoubleClick={openModal}
        className="curri-button"
        style={buttonStyle()}>
        {concept.name}
      </button>
      <Modal
        isOpen={modalOpen}
        style={customStyles}
        onRequestClose={closeModal}
        contentLabel={'Test modal'}
      >
        <ConceptUpdateForm concept={concept} closeModal={closeModal} updateConcept={updateConcept}/>

      </Modal>
    </React.Fragment>


  )
}


export default ConceptButton