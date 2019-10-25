const internalSortConcepts = (concepts, method, order) => {
  switch (method) {
  case 'CUSTOM':
    return order
      .map(orderedId => {
        const index = concepts.findIndex(concept => concept.id === orderedId)
        return index >= 0 ? concepts.splice(index, 1)[0] : null
      })
      .filter(concept => concept !== null)
      .concat(concepts)
  case 'ALPHA_ASC':
    return concepts.sort((a, b) => a.name.localeCompare(b.name, 'fi'))
  case 'ALPHA_DESC':
    return concepts.sort((a, b) => b.name.localeCompare(a.name, 'fi'))
  case 'CREATION_ASC':
    return concepts
  case 'CREATION_DESC':
    return concepts.reverse()
  default:
    return concepts
  }
}

export const sortedConcepts = (course, method = null) => {
  const isOrdered = course.conceptOrder.length === 1
    && course.conceptOrder[0].startsWith('__ORDER_BY__')
  const concepts = course.concepts.slice()
  const conceptOrder = course.conceptOrder
  method = method || (isOrdered ? course.conceptOrder[0].substr('__ORDER_BY__'.length) : 'CUSTOM')
  return internalSortConcepts(concepts, method, conceptOrder)
}

const internalSortCourses = (courses = [], order = [], keyCallback = course => course.id) => order
  .map(orderedId => {
    const index = courses.findIndex(course => keyCallback(course) === orderedId)
    return index >= 0 ? courses.splice(index, 1)[0] : null
  })
  .filter(course => course !== null)
  .concat(courses)

export const sortedCourses = (workspace, keyCallback) =>
  internalSortCourses(workspace.courses.slice(), workspace.courseOrder, keyCallback)
