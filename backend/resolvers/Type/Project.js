const { checkAccess } = require('../../accessControl')

module.exports = {
  Project: {
    participants(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).participants()
    },
    workspaces(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).workspaces()
    },
    template(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).template()
    },
    async tokens(root, args, context) {
      await checkAccess(context, {
        checkPrivilege: { requiredPrivilege: 'OWNER', workspaceId: root.id }
      })
      return await context.prisma.project({
        id: root.id
      }).tokens()
    }
  }
}
