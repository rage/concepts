import makeTypeResolvers from './typeutil'

export const PointGroup = makeTypeResolvers('pointGroup', [
  'workspace',
  'course',
  'completions'
])
