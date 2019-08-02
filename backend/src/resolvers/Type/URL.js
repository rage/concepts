const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  URL: makeTypeResolvers('uRL', [
    'resource'
  ])
}
