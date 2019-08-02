const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  User: makeTypeResolvers('user', [
    'workspaceParticipations',
    'projectParticipations'
  ])
}
