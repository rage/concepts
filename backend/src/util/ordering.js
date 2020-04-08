const internalSortItems = (items, method, order) => {
  switch (method) {
  case 'CUSTOM':
    return order
      .map(orderedId => {
        const index = items.findIndex(item => item.id === orderedId)
        return index >= 0 ? items.splice(index, 1)[0] : null
      })
      .filter(item => item !== null)
      .concat(items)
  case 'ALPHA_ASC':
    return items.sort((a, b) => a.name.localeCompare(b.name, 'fi'))
  case 'ALPHA_DESC':
    return items.sort((a, b) => b.name.localeCompare(a.name, 'fi'))
  case 'CREATION_ASC':
    return items
  case 'CREATION_DESC':
    return items.reverse()
  default:
    return items
  }
}

export const sortedItems = (items, order, method = null) => {
  const isOrdered = order.length === 1 && order[0].startsWith('__ORDER_BY__')
  items = items.slice()
  method = method || (isOrdered ? order[0].substr('__ORDER_BY__'.length) : 'CUSTOM')
  return internalSortItems(items, method, order)
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
