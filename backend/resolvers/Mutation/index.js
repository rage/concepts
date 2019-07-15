const authentication = require('./Authentication')
const course = require('./Course')
const courseLink = require('./CourseLink')
const concept = require('./Concept')
const conceptLink = require('./ConceptLink')
const workspace = require('./Workspace')
const project = require('./Project')
const port = require('./Port')
const guest = require('./Guest')

module.exports = {
  ...authentication,
  ...course,
  ...courseLink,
  ...concept,
  ...conceptLink,
  ...workspace,
  ...project,
  ...port,
  ...guest
}
