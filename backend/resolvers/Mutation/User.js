const { checkAccess } = require('../../accessControl')

const UserMutations = {
  async updateUser(root, { id, guideProgress }, context) {
    await checkAccess(context, {
      allowGuest: true,
      allowStudent: true,
      allowStaff: true,
      verifyUser: true,
      userId: id
    })
    return await context.prisma.updateUser({
      where: { id },
      data: { guideProgress }
    })
  }
}

module.exports = UserMutations
