import client from '../apolloClient'
import { LINKS_IN_COURSE } from '../../graphql/Query'

const createConceptLinkUpdate = courseId =>
  (store, response) => {
    try {
      const createdConceptLink = response.data.createConceptLink

      const course = store.readQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId }
      })

      const concept = course.linksInCourse.concepts
        .find(concept => concept.id === createdConceptLink.to.id)
      if (concept) {
        concept.linksToConcept.push(createdConceptLink)
      }

      client.writeQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId },
        data: course
      })
    } catch (e) {
      console.error('createConceptLinkUpdate', e)
    }
  }

const deleteConceptLinkUpdate = courseId =>
  (store, response) => {
    try {
      const deletedConceptLink = response.data.deleteConceptLink

      const course = store.readQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId }
      })

      course.linksInCourse.concepts.forEach(concept => {
        concept.linksToConcept = concept.linksToConcept
          .filter(conceptLink => conceptLink.id !== deletedConceptLink.id)
      })

      client.writeQuery({
        query: LINKS_IN_COURSE,
        variables: { courseId },
        data: course
      })
    } catch (e) {
      console.error('deleteConceptLinkUpdate', e)
    }
  }

export {
  createConceptLinkUpdate,
  deleteConceptLinkUpdate
}
