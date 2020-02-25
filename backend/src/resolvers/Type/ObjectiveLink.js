import makeTypeResolvers from './typeutil'

export const ObjectiveLink = makeTypeResolvers('objectiveLink', [
  'objective',
  'course',
  'workspace',
  'createdBy'
])
