const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  PointGroup: makeTypeResolvers('pointGroup', [
    'workspace',
    'course',
    'completions'
  ])
}
