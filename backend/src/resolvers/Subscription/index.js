const concept = require('./Concept')
const conceptLink = require('./ConceptLink')
const course = require('./Course')
const courseLink = require('./CourseLink')

module.exports = {
  ...concept,
  ...conceptLink,
  ...course,
  ...courseLink
}