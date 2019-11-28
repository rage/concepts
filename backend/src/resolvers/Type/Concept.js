import makeTypeResolvers from './typeutil'

export const Concept = makeTypeResolvers('concept', [
  'linksToConcept',
  'linksFromConcept',
  'objectiveLinks',
  'course',
  'createdBy',
  'workspace',
  'tags'
])
