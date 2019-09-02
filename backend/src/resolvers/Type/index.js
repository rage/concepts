const concept = require('./Concept')
const conceptLink = require('./ConceptLink')
const course = require('./Course')
const courseLink = require('./CourseLink')
const workspace = require('./Workspace')
const project = require('./Project')
const url = require('./URL')
const resource = require('./Resource')
const user = require('./User')
const workspaceToken = require('./WorkspaceToken')
const projectToken = require('./ProjectToken')
const workspaceParticipant = require('./WorkspaceParticipant')
const projectParticipant = require('./ProjectParticipant')
const pointGroup = require('./PointGroup')
const completion = require('./Completion')

module.exports = {
  ...concept,
  ...conceptLink,
  ...course,
  ...courseLink,
  ...workspace,
  ...project,
  ...url,
  ...resource,
  ...user,
  ...workspaceToken,
  ...projectToken,
  ...workspaceParticipant,
  ...projectParticipant,
  ...pointGroup,
  ...completion
}
