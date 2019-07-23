const { checkPrivilege, Privilege } = require('../../accessControl')

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
      if (!(await checkPrivilege(context, {
        minimumPrivilege: Privilege.OWNER,
        workspaceId: root.id
      }))) {
        return []
      }
      return await context.prisma.project({
        id: root.id
      }).tokens()
    }
  }
}
