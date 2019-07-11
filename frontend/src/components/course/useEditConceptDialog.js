import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { UPDATE_CONCEPT } from '../../graphql/Mutation'
import { updateConceptUpdate } from '../../apollo/update'
import ConceptEditingDialog from '../concept/ConceptEditingDialog'

const useEditConceptDialog = (activeCourse, workspaceId) => {
  const [conceptEditState, setConceptEditState] = useState({
    open: false,
    conceptId: '',
    name: '',
    description: '',
    courseId: ''
  })

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: updateConceptUpdate(activeCourse.id, workspaceId, conceptEditState.courseId)
  })

  const handleConceptEditClose = () => {
    setConceptEditState({ open: false, conceptId: '', name: '', description: '', courseId: '' })
  }

  const handleConceptEditOpen = (conceptId, name, description, courseId) => () => {
    setConceptEditState({ open: true, conceptId, name, description, courseId })
  }

  const dialog = (
    <ConceptEditingDialog
      state={conceptEditState}
      handleClose={handleConceptEditClose}
      updateConcept={updateConcept}
      defaultDescription={conceptEditState.description}
      defaultName={conceptEditState.name}
    />
  )

  return {
    openEditConceptDialog: handleConceptEditOpen,
    ConceptEditDialog: dialog
  }
}

export default useEditConceptDialog
