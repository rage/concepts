import makeTypeResolvers from './typeutil'

export const Course = makeTypeResolvers('course', [
  'concepts',
  'linksToCourse',
  'linksFromCourse',
  'createdBy',
  'workspace',
  'objectives',
  'tags'
])
