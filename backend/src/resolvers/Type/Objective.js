import makeTypeResolvers from './typeutil'

export const Objective = makeTypeResolvers('objective', [
  'linksFromObjective',
  'linksToObjective',
  'linksFromConcept',
  'workspace',
  'course',
  'createdBy'
])
