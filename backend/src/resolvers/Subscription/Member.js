import { canViewProject } from '../../util/accessControl'
import { makeSubscriptionResolvers } from './subscriptionUtil'

export const {
  workspaceMemberCreated, workspaceMemberUpdated, workspaceMemberDeleted
} = makeSubscriptionResolvers(
  'workspace member', ['create', 'update', 'delete'])

export const {
  projectMemberCreated, projectMemberUpdated, projectMemberDeleted
} = makeSubscriptionResolvers(
  'project member', ['create', 'update', 'delete'],
  'projectId', 'projectId', canViewProject)
