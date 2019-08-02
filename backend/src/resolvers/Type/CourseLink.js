const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  CourseLink: makeTypeResolvers('courseLink', [
    'to',
    'from',
    'createdBy',
    'workspace'
  ])
}
