const { checkAccess, Role, Privilege } = require('../../accessControl')

const WorkspaceQueries = {
  async allWorkspaces(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.workspaces()
  },
  async workspaceById(root, args, context) {
    const workspace = await context.prisma.workspace({
      id: args.id
    })
    if (!workspace.public) {
      await checkAccess(context, {
        minimumRole: Role.GUEST,
        minimumPrivilege: Privilege.READ,
        workspaceId: args.id
      })
    }
    return workspace
  },
  async workspacesForUser(root, args, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    return await context.prisma.user({
      id: context.user.id
    }).workspaceParticipations()
  }
}

module.exports = WorkspaceQueries
