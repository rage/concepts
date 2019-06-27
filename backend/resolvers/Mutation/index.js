const authentication = require('./Authentication')
const course = require('./Course')
const courseLink = require('./CourseLink')
const concept = require('./Concept')
const conceptLink = require('./ConceptLink')
const workspace = require('./Workspace')
const project = require('./Project')

module.exports = {
  ...authentication,
  ...course,
  ...courseLink,
  ...concept,
  ...conceptLink,
  ...workspace,
  ...project
}