const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  WorkspaceParticipant: makeTypeResolvers('workspaceParticipant', [
    'workspace',
    'token',
    'user'
  ])
}
