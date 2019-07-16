const { checkAccess } = require('../../accessControl')

const UserMutations = {
  updateUser(root, { id, guideProgress }, context) {
    checkAccess(context, {
      allowStudent: true,
      allowStaff: true,
      verifyUser: true,
      userId: id
    })
    return context.prisma.updateUser({
      where: { id },
      data: { guideProgress }
    })
  }
}

module.exports = UserMutations
