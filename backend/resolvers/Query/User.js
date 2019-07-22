const { checkAccess } = require('../../accessControl')

const User = {
  async allUsers(root, args, context) {
    await checkAccess(context, { allowStaff: true })
    return await context.prisma.users()
  },
  async userById(root, { id }, context) {
    await checkAccess(context, {
      allowGuest: id == context.user.id,
      allowStudent: id == context.user.id,
      allowStaff: true,
    })
    return context.prisma.user({ id })
  }
}

module.exports = User
