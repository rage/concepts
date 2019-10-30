import makeTypeResolvers from './typeutil'

export const WorkspaceToken = makeTypeResolvers('workspaceToken', [
  'participants',
  'workspace'
])
