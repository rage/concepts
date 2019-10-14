import authentication from './Authentication'

const course = require('./Course')
const workspace = require('./Workspace')
const project = require('./Project')
const sharing = require('./Sharing')
const user = require('./User')
const port = require('./Export')
module.exports = {
  ...authentication,
  ...course,
  ...workspace,
  ...project,
  ...sharing,
  ...user,
  ...port
}
