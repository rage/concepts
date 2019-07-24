const { checkPrivilege, Privilege } = require('../../accessControl')

module.exports = {
  Workspace: {
    async tokens(root, args, context) {
      if (!(await checkPrivilege(context, {
        minimumPrivilege: Privilege.OWNER,
        workspaceId: root.id
      }))) {
        return []
      }
      return await context.prisma.workspace({
        id: root.id
      }).tokens()
    },
    participants(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).participants()
    },
    project(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).project()
    },
    courses(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).courses()
    },
    conceptLinks(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).conceptLinks()
    },
    courseLinks(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).courseLinks()
    },
    concepts(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).concepts()
    }
  }
}
