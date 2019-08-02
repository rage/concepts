const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  ProjectParticipant: makeTypeResolvers('projectParticipant', [
    'project', 'token', 'user'
  ])
}
