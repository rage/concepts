const { checkAccess } = require('../../accessControl')

const User = {
  allUsers(root, args, context) {
    checkAccess(context)
    return context.prisma.users()
  },
  userById(root, args, context) {
    checkAccess(context, { 
      allowStudent: true, 
      allowStaff: true, 
      verifyUser: true, 
      userId: args.id 
    })
    return context.prisma.user({
      id: args.id
    })
  }
}

module.exports = User