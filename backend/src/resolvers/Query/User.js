const { checkAccess, Role } = require('../../accessControl')

const User = {
  async allUsers(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.users()
  },
  async userById(root, { id }, context) {
    await checkAccess(context, {
      minimumRole: id === context.user.id ? Role.GUEST : Role.STAFF
    })
    return context.prisma.user({ id })
  }
}

module.exports = User
