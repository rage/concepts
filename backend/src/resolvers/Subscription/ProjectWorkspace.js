import { canViewProject } from '../../util/accessControl'
import { makeSubscriptionResolvers } from './subscriptionUtil'

export const {
  projectWorkspaceCreated, projectWorkspaceUpdated, projectWorkspaceDeleted
} = makeSubscriptionResolvers(
  'project workspace', ['create', 'update', 'delete'],
  'pId', 'projectId', canViewProject)
