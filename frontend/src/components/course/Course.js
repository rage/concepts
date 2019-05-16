import React, { useState } from 'react'
import HeaderButton from './HeaderButton'
import ConceptButton from '../concept/ConceptButton'
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

const CourseColumn = ({ course, linkPrerequisite, activeConceptId, deleteLink, createConcept }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = () => {
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <div className="curri-column">
      <HeaderButton text={course.name} />
      {course.concepts.map(concept =>
        <ConceptButton
          concept={concept}
          key={concept.id}
          linkPrerequisite={linkPrerequisite}
          deleteLink={deleteLink}
          activeConceptId={activeConceptId}
        />
      )}
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


export default CourseColumn