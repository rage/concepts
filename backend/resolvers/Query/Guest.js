const { checkAccess } = require('../../accessControl')

const GuestQueries = {
  allGuests(root, args, context) {
    checkAccess(context) // Only allow admin
    return context.prisma.guests()
  }
}

module.exports = GuestQueries