import { ForbiddenError } from 'apollo-server-core'
import { checkAccess, Role, Privilege } from '../../util/accessControl'

export const createGoalLink = async (root, {goalId, courseId, workspaceId}, context) => {
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const course = nullShield(await context.prisma.course({ id: cousreId }))
  const goal = nullShield(await context.prisma.concept({ id: goalId }))
  if (goal.level !== 'GOAL') {
    throw new ForbiddenError("Concept does not have level of GOAL")
  }
  return await context.prisma.createGoalLink({
    goalId,
    courseId
  })
}

export const deleteGoalLink = async (root, {id}, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.concept({ id: ids[0] }).workspace())
  await checkAccess({
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  return await context.prisma.deleteGoalLink({ id })
}