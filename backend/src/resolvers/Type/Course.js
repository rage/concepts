const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  Course: makeTypeResolvers('course', [
    'concepts',
    'linksToCourse',
    'linksFromCourse',
    'createdBy',
    'workspace'
  ])
}
