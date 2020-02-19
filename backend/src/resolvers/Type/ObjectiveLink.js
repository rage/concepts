import makeTypeResolvers from './typeutil'

export const ObjectiveLink = makeTypeResolvers('objectiveLink', [
  'goal',
  'course',
  'workspace',
  'createdBy',
  'text'
])
