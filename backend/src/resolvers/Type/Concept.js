import makeTypeResolvers from './typeutil'

export const Concept = makeTypeResolvers('concept', [
  'linksToConcept',
  'linksFromConcept',
  'sourceConcept',
  'clones',
  'sourceCommon',
  'commonClones',
  'course',
  'createdBy',
  'workspace',
  'tags'
])
