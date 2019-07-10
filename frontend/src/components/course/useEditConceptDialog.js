import { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { UPDATE_CONCEPT } from '../../graphql/Mutation'
import { updateConceptUpdate } from '../../apollo/update'

const useCreateConceptDialog = (activeCourse, workspaceId) => {
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

  return {
    openEditConceptDialog: handleConceptEditOpen,
    closeEditConceptDialog: handleConceptEditClose,
    conceptEditState,
    updateConcept
  }
}

export default useCreateConceptDialog
