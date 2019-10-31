import makeTypeResolvers from './typeutil'

export const WorkspaceParticipant = makeTypeResolvers('workspaceParticipant', [
  'workspace',
  'token',
  'user'
])
