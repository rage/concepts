const checkAccess = require('../../accessControl')

const WorkspaceQueries = {
    allWorkspaces(root, args, context) {
      return context.prisma.workspace()
    },
    workspaceById(root, args, context) {
      checkAccess(context, { allowStaff: true, allowStudent: true })
      return context.prisma.workspace({
        id: args.id
      })
    }
}

module.exports = WorkspaceQueries