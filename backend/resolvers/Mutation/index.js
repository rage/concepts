const authentication = require('./Authentication')
const course = require('./Course')
const courseLink = require('./CourseLink')
const concept = require('./Concept')
const conceptLink = require('./ConceptLink')

module.exports = {
  ...authentication,
  ...course,
  ...courseLink,
  ...concept,
  ...conceptLink
}