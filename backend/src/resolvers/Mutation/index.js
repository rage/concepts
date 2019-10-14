import authentication from './Authentication'
import course from './Course'
import courseLink from './CourseLink'
import concept from './Concept'
import conceptLink from './ConceptLink'
import workspace from './Workspace'
import sharing from './Sharing'
import project from './Project'
import port from './Import'
import merge from './Merge'
import pointGroup from './PointGroup'

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
