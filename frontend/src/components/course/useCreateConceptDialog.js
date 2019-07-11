import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_PREREQUISITES } from '../../graphql/Query'
import client from '../../apollo/apolloClient'
import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'

const useCreateConceptDialog = (activeCourse, workspaceId) => {

  const [conceptCreateState, setConceptCreateState] = useState({
    open: false,
    id: ''
  })

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: (store, response) => {
      try {
        const dataInStore = store.readQuery({
          query: COURSE_PREREQUISITES,
          variables: { courseId: activeCourse.id, workspaceId }
        })
        const addedConcept = response.data.createConcept
        const dataInStoreCopy = { ...dataInStore }
        const courseLink = dataInStoreCopy.courseAndPrerequisites.linksToCourse.find(link =>
          link.from.id === conceptCreateState.id
        )
        const course = courseLink.from
        if (!includedIn(course.concepts, addedConcept)) {
          course.concepts.push(addedConcept)
          client.writeQuery({
            query: COURSE_PREREQUISITES,
            variables: { courseId: activeCourse.id, workspaceId },
            data: dataInStoreCopy
          })
        }
      } catch (error) {
        return
      }
    }
  })

  const handleConceptClose = () => {
    setConceptCreateState({ ...conceptCreateState, open: false, id: '' })
  }

  const handleConceptOpen = (courseId) => () => {
    setConceptCreateState({ open: true, id: courseId })
  }

  const dialog = (
    <ConceptAdditionDialog
      state={conceptCreateState}
      handleClose={handleConceptClose}
      createConcept={createConcept}
      workspaceId={workspaceId}
    />
  )

  return {
    openCreateConceptDialog: handleConceptOpen,
    ConceptCreateDialog: dialog
  }
}

export default useCreateConceptDialog
