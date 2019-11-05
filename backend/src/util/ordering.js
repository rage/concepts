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

export const sortedConcepts = (concepts, order, method = null) => {
  const isOrdered = order.length === 1 && order[0].startsWith('__ORDER_BY__')
  concepts = concepts.slice()
  method = method || (isOrdered ? order[0].substr('__ORDER_BY__'.length) : 'CUSTOM')
  return internalSortConcepts(concepts, method, order)
}

const internalSortCourses = (courses = [], order = [], keyCallback = course => course.id) => order
  .map(orderedId => {
    const index = courses.findIndex(course => keyCallback(course) === orderedId)
    return index >= 0 ? courses.splice(index, 1)[0] : null
  })
  .filter(course => course !== null)
  .concat(courses)

export const sortedCourses = (courses, order, keyCallback) =>
  internalSortCourses(courses.slice(), order, keyCallback)
