const { checkAccess, Role, Privilege } = require('../../accessControl')

const WorkspaceQueries = {
  async allWorkspaces(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.workspaces()
  },
  async workspaceById(root, args, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.READ,
      workspaceId: args.id
    })
    return await context.prisma.workspace({
      id: args.id
    })
  },
  async workspacesForUser(root, args, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    return await context.prisma.user({
      id: context.user.id
    }).workspaceParticipations()
  },
  async peekWorkspace(root, { tokenId }, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    // TODO check if token is valid
    return await context.prisma.workspaceToken({
      id: tokenId
    }).workspace()
  }
}

module.exports = WorkspaceQueries
