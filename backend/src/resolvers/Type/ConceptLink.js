import makeTypeResolvers from './typeutil'

export const ConceptLink = makeTypeResolvers('conceptLink', [
  'to',
  'from',
  'createdBy',
  'workspace'
])
