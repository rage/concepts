import { ForbiddenError } from 'apollo-server-core'

import { nullShield } from '../../util/errors'
import { checkAccess, Role, Privilege } from '../../util/accessControl'
import pubsub from '../Subscription/pubsub'
import * as channels from '../Subscription/channels'

export const createGoalLink = async (root, { goalId, courseId, workspaceId }, context) => {
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const goal = nullShield(await context.prisma.concept({ id: goalId }))
  if (goal.level !== 'GOAL') {
    throw new ForbiddenError("Can't create goal link to a non-goal concept")
  }
  const createdLink = await context.prisma.createGoalLink({
    goalId,
    courseId,
    workspaceId,
    createdBy: { connect: { id: context.user.id } }
  })

  pubsub.publish(channels.GOAL_LINK_CREATED, {
    goalLinkCreated: { ...createdLink, workspaceId }
  })
  return createdLink
}

export const deleteGoalLink = async (root, { id }, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
  await checkAccess({
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  await context.prisma.deleteGoalLink({ id })
  // TODO
  /*pubsub.publish(channels.GOAL_LINK_DELETED, {
    goalLinkDeleted: { workspaceId }
  })*/
}