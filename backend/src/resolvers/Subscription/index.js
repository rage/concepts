import { canViewProject } from '../../util/accessControl'
import { makeSubscriptionResolvers } from './subscriptionUtil'

export default {
  ...makeSubscriptionResolvers('concept', ['create', 'update', 'delete']),
  ...makeSubscriptionResolvers('concept link', ['create', 'delete']),
  ...makeSubscriptionResolvers('course', ['create', 'update', 'delete']),
  ...makeSubscriptionResolvers('course link', ['create', 'update', 'delete']),
  ...makeSubscriptionResolvers('workspace member', ['create', 'update', 'delete']),
  ...makeSubscriptionResolvers('workspace', ['update', 'delete']),
  ...makeSubscriptionResolvers('project member', ['create', 'update', 'delete'],
    'projectId', 'projectId', canViewProject),
  ...makeSubscriptionResolvers('project workspace', ['create', 'update', 'delete'],
    'pId', 'projectId', canViewProject)
}
