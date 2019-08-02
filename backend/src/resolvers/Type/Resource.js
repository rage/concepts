const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  Resource: makeTypeResolvers('resource', [
    'urls'
  ])
}
