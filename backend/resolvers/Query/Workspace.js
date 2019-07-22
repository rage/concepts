const { checkAccess } = require('../../accessControl')

const WorkspaceQueries = {
  allWorkspaces(root, args, context) {
    checkAccess(context, { allowStaff: true })
    return context.prisma.workspaces()
  },
  async workspaceById(root, args, context) {
    const workspace = await context.prisma.workspace({
      id: args.id
    })
    if (!workspace.public) {
      checkAccess(context, { allowGuest: true, allowStaff: true, allowStudent: true })
    }
    return workspace
  },
  async workspacesForUser(root, args, context) {
    checkAccess(context, {
      allowStudent: true,
      allowStaff: true,
      allowGuest: true,
      verifyUser: true,
      userId: args.ownerId
    })

    return await context.prisma.user({
        id: args.ownerId
      
    }).workspaceParticipations()
    
  }
}

module.exports = WorkspaceQueries
