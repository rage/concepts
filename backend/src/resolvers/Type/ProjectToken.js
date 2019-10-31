import makeTypeResolvers from './typeutil'

export const ProjectToken = makeTypeResolvers('projectToken', [
  'participants',
  'project'
])
