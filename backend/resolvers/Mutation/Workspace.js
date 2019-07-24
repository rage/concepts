const { checkAccess, Role, Privilege } = require('../../accessControl')

const WorkspaceMutations = {
  async createWorkspace(root, args, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    return await context.prisma.createWorkspace({
      name: args.name,
      project: args.projectId !== undefined ? {
        connect: { id: args.projectId }
      } : null,
      participants: {
        create: [{
          privilege: 'OWNER',
          user: {
            connect: { id: context.user.id }
          }
        }]
      }
    })
  },
  async deleteWorkspace(root, { id }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId: id
    })
    return context.prisma.deleteWorkspace({ id })
  },
  async updateWorkspace(root, { id, name }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId: id
    })
    return context.prisma.updateWorkspace({
      where: { id },
      data: { name }
    })
  }
}

module.exports = WorkspaceMutations
