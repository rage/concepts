const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  ConceptLink: makeTypeResolvers('conceptLink', [
    'to',
    'from',
    'createdBy',
    'workspace'
  ])
}
