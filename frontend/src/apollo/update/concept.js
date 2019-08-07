import {
  COURSE_PREREQ_FRAGMENT
} from '../../graphql/Query'

const createConcept = (store, response) => {
  try {
    const addedConcept = response.data.createConcept
    const course = store.readFragment({
      id: addedConcept.courses[0].id,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: addedConcept.courses[0].id,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: [...course.concepts, addedConcept]
      }
    })
  } catch (error) { }
}

const deleteConceptUpdate = (store, response) => {
  try {
    const deletedConcept = response.data.deleteConcept
    const course = store.readFragment({
      id: deletedConcept.courseId,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: deletedConcept.courseId,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: course.concepts.filter(c => c.id !== deletedConcept.id)
      }
    })
  } catch (error) { }
}

const updateConceptUpdate = (store, response) => {
  try {
    const updatedConcept = response.data.updateConcept
    const course = store.readFragment({
      id: updatedConcept.courses[0].id,
      fragment: COURSE_PREREQ_FRAGMENT
    })
    store.writeFragment({
      id: updatedConcept.courses[0].id,
      fragment: COURSE_PREREQ_FRAGMENT,
      data: {
        ...course,
        concepts: course.concepts.map(c => c.id === updatedConcept.id ? updatedConcept : c)
      }
    })
  } catch (error) { }
}

export {
  deleteConceptUpdate,
  updateConceptUpdate,
  createConcept
}
