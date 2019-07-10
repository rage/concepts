import { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_PREREQUISITES } from '../../graphql/Query'
import client from '../../apollo/apolloClient'

const useCreateConceptDialog = (activeCourse, workspaceId) => {

  const [conceptState, setConceptState] = useState({
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
          link.from.id === conceptState.id
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
    setConceptState({ ...conceptState, open: false, id: '' })
  }

  const handleConceptOpen = (courseId) => () => {
    setConceptState({ open: true, id: courseId })
  }

  return {
    openCreateConceptDialog: handleConceptOpen,
    closeCreateConceptDialog: handleConceptClose,
    conceptCreateState: conceptState,
    createConcept
  }
}

export default useCreateConceptDialog
