const { checkAccess } = require('../../accessControl')

const WorkspaceQueries = {
  allWorkspaces(root, args, context) {
    checkAccess(context, { allowStudent: true, allowStaff: true })
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
  }
}

module.exports = WorkspaceQueries