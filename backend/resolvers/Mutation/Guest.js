const { checkAccess } = require('../../accessControl')

const GuestMutations = {
  async createGuest(root, args, context) {
    checkAccess(context, { allowGuest: true })
    return await context.prisma.createGuest({})
  }
}

module.exports = GuestMutations