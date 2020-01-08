import makeTypeResolvers from './typeutil'

export const Completion = makeTypeResolvers('completion', [
  'user',
  'pointGroup'
])
