import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_PREREQUISITES, COURSE_BY_ID } from '../../graphql/Query'
import client from '../../apollo/apolloClient'
import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'

const useCreateConceptDialog = (activeCourse, workspaceId, prerequisite = false) => {

  const [conceptCreateState, setConceptCreateState] = useState({
    open: false,
    id: ''
  })

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: prerequisite ? (store, response) => {
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
      } catch (error) {}
    }
      :
      (store, response) => {
        const dataInStore = store.readQuery({
          query: COURSE_BY_ID,
          variables: {
            id: activeCourse.id
          }
        })
        const addedConcept = response.data.createConcept
        const dataInStoreCopy = { ...dataInStore }
        const concepts = dataInStoreCopy.courseById.concepts
        if (!includedIn(concepts, addedConcept)) {
          dataInStoreCopy.courseById.concepts.push(addedConcept)
          client.writeQuery({
            query: COURSE_BY_ID,
            variables: {
              id: activeCourse.id
            },
            data: dataInStoreCopy
          })
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
