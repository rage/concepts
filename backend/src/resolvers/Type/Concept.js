import makeTypeResolvers from './typeutil'

export const Concept = makeTypeResolvers('concept', [
  'linksToConcept',
  'linksFromConcept',
  'course',
  'resources',
  'createdBy',
  'workspace',
  'tags'
])
