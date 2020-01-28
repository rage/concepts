import makeTypeResolvers from './typeutil'

export const Course = makeTypeResolvers('course', [
  'concepts',
  'linksToCourse',
  'linksFromCourse',
  'goalLinks',
  'createdBy',
  'workspace',
  'tags'
])
