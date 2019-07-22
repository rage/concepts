const { checkAccess } = require('../../accessControl')

const WorkspaceQueries = {
  async allWorkspaces(root, args, context) {
    await checkAccess(context, { allowStaff: true })
    return await context.prisma.workspaces()
  },
  async workspaceById(root, args, context) {
    const workspace = await context.prisma.workspace({
      id: args.id
    })
    if (!workspace.public) {
      await checkAccess(context, {
        allowGuest: true, allowStaff: true, allowStudent: true,
        checkPrivilege: { requiredPrivilege: 'READ', workspaceId: args.id }
      })
    }
    return workspace
  },
  async workspacesForUser(root, args, context) {
    await checkAccess(context, {
      allowStudent: true,
      allowStaff: true,
      allowGuest: true,
      verifyUser: true
    })
    return await context.prisma.user({
      id: context.user.id
    }).workspaceParticipations()
  }
}

module.exports = WorkspaceQueries
