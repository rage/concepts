import { checkAccess, Role } from '../../util/accessControl'

export const allUsers = async (root, args, context) => {
  await checkAccess(context, { minimumRole: Role.ADMIN })
  return await context.prisma.users()
}

export const userById = async (root, { id }, context) => {
  await checkAccess(context, {
    minimumRole: id === context.user.id ? Role.GUEST : Role.STAFF
  })
  return context.prisma.user({ id })
}
