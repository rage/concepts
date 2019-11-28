import makeTypeResolvers from './typeutil'

export const Objective = makeTypeResolvers('objective', [
  'linksFromObjective',
  'linksToObjective',
  'conceptLinks',
  'workspace',
  'course',
  'createdBy'
])
