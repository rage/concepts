const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  Completion: makeTypeResolvers('completion', [
    'user'
  ])
}
