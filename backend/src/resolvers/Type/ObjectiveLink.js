import makeTypeResolvers from './typeutil'

export const ObjectiveLink = makeTypeResolvers('objectiveLink', [
  'from',
  'to',
  'workspace',
  'createdBy'
])
