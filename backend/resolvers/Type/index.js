const concept = require('./Concept')
const conceptLink = require('./ConceptLink')
const course = require('./Course')
const courseLink = require('./CourseLink')
const workspace = require('./Workspace')
const project = require('./Project')
const url = require('./URL')
const resource = require('./Resource')
const user = require('./User')

module.exports = {
  ...concept,
  ...conceptLink,
  ...course,
  ...courseLink,
  ...workspace,
  ...project,
  ...url,
  ...resource,
  ...user
}
