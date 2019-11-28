import makeTypeResolvers from './typeutil'

export const ConceptObjectiveLink = makeTypeResolvers('conceptObjectiveLink', [
  'from',
  'to',
  'workspace',
  'createdBy'
])
