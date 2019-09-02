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
const merge = require('./Merge')
const pointGroup = require('./PointGroup')

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
  ...user,
  ...merge,
  ...pointGroup
}
