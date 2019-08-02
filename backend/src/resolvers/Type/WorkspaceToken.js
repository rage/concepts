const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  WorkspaceToken: makeTypeResolvers('workspaceToken', [
    'participants',
    'workspace'
  ])
}
