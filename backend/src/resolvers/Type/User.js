import makeTypeResolvers from './typeutil'

export const User = makeTypeResolvers('user', [
  'workspaceParticipations',
  'projectParticipations'
])
