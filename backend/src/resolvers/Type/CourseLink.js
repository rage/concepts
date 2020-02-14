import makeTypeResolvers from './typeutil'

export const CourseLink = makeTypeResolvers('courseLink', [
  'to',
  'from',
  'createdBy',
  'workspace',
  'text'
])
