const { checkAccess } = require('../../accessControl')

const PortQueries = {
  async exportData(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    const workspace = await context.prisma.workspace({
      id: args.workspaceId
    })

    if (!workspace) {
      throw new Error("Workspace not found")
    }

    // Create json from workspace
    const jsonData = {
      'workspaceId': workspace.id,
      'workspace': workspace.name
    }

    console.log(workspace.courses)

    return JSON.stringify(jsonData)
  }
}

module.exports = PortQueries