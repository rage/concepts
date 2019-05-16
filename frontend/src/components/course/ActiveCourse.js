import React, { useState } from 'react'
import HeaderButton from './HeaderButton'
import ActivatableConcept from '../concept/ActivatableConcept'
import Modal from 'react-modal'
import ConceptForm from '../concept/ConceptForm'

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

Modal.setAppElement('#root')

const ActiveCourse = ({ course, activateConcept, activeConceptId, createConcept }) => {

  const [modalOpen, setModalOpen] = useState(false)

  const openModal = () => {
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <div className="left-menu">
      <HeaderButton text={course.name} />

      <div className="left-menu-scroll">
        <div className="left-menu-concepts">
          {course.concepts.map(concept =>
            <ActivatableConcept
              concept={concept}
              key={concept.id}
              activeConceptId={activeConceptId}
              activateConcept={activateConcept}
            />
          )}
        </div>

      </div>
      <HeaderButton onClick={openModal} text='+' />
      <Modal
        isOpen={modalOpen}
        style={customStyles}
        onRequestClose={closeModal}
        contentLabel={'Test modal'}
      >
        <ConceptForm course_id={course.id} createConcept={createConcept} closeModal={closeModal} />
      </Modal>
    </div>
  )
}

export default ActiveCourse