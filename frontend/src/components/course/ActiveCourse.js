import React, { useState } from 'react'
import HeaderButton from './HeaderButton'
import ActivatableConcept from '../concept/ActivatableConcept'
import Modal from 'react-modal'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
}

Modal.setAppElement('#root')

const ActiveCourse = ({ course, activateConcept, activeConceptId }) => {

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
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel={'Test modal'}
      >
        <h2>Hello</h2>
        <button onClick={closeModal}>close</button>
        <div>I am a modal</div>
        <form>
          <input />
          <button>tab navigation</button>
          <button>stays</button>
          <button>inside</button>
          <button>the modal</button>
        </form>
      </Modal>
    </div>
  )
}

export default ActiveCourse