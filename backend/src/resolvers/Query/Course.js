import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { nullShield } from '../../util/errors'

export const courseById = async (root, { id }, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.VIEW,
    workspaceId
  })
  return await context.prisma.course({ id: id })
}
