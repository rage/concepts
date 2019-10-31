import makeTypeResolvers from './typeutil'

export const ProjectParticipant = makeTypeResolvers('projectParticipant', [
  'project', 'token', 'user'
])
