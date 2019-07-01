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
      checkAccess(context, { allowStaff: true, allowStudent: true })
    }
    return workspace
  },
  async workspacesByOwner(root, args, context) {
    checkAccess(context, {
      allowStudent: true,
      allowStaff: true,
      verifyUser: true,
      userId: args.ownerId
    })
    const workspaces = await context.prisma.workspaces({
      where: {
        owner: {
          id: args.ownerId
        }
      }
    })
    return workspaces
  }
}

module.exports = WorkspaceQueries
