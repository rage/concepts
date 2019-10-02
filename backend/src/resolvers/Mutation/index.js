const authentication = require('./Authentication')
const course = require('./Course')
const courseLink = require('./CourseLink')
const concept = require('./Concept')
const conceptLink = require('./ConceptLink')
const workspace = require('./Workspace')
const sharing = require('./Sharing')
const project = require('./Project')
const port = require('./Import')
const merge = require('./Merge')
const pointGroup = require('./PointGroup')

module.exports = {
  ...authentication,
  ...course,
  ...courseLink,
  ...concept,
  ...conceptLink,
  ...workspace,
  ...sharing,
  ...project,
  ...port,
  ...merge,
  ...pointGroup
}
