const { checkAccess, Role } = require('../../accessControl')

const UserMutations = {
  async updateUser(root, { id, guideProgress }, context) {
    await checkAccess(context, {
      minimumRole: id === context.user.id ? Role.GUEST : Role.STAFF
    })
    return await context.prisma.updateUser({
      where: { id },
      data: { guideProgress }
    })
  }
}

module.exports = UserMutations
