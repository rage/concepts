import makeTypeResolvers from './typeutil'

export const Concept = makeTypeResolvers('concept', [
  'linksToConcept',
  'linksFromConcept',
  'linksToObjective',
  'course',
  'createdBy',
  'workspace',
  'tags'
])
