const authentication = require('./Authentication')
const course = require('./Course')
const courseLink = require('./CourseLink')
const concept = require('./Concept')
const conceptLink = require('./ConceptLink')
const workspace = require('./Workspace')
const workspaceSharing = require('./WorkspaceSharing')
const project = require('./Project')
const port = require('./Port')
const user = require('./User')

module.exports = {
  ...authentication,
  ...course,
  ...courseLink,
  ...concept,
  ...conceptLink,
  ...workspace,
  ...workspaceSharing,
  ...project,
  ...port,
  ...user
}
