const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  ProjectToken: makeTypeResolvers('projectToken', [
    'participants',
    'project'
  ])
}
