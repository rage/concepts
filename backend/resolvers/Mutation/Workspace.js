const { checkAccess, checkPrivilege } = require('../../accessControl')

const WorkspaceMutations = {
  async createWorkspace(root, args, context) {
    checkAccess(context, { allowGuest: true, allowStudent: true, allowStaff: true })
    return await context.prisma.createWorkspace({
      name: args.name,
      public: context.role === 'GUEST',
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
    checkAccess(context, {
      allowGuest: true, allowStudent: true, allowStaff: true, verifyUser: true
    })
    await checkPrivilege(context, { requiredPrivilege: 'OWNER', workspaceId: id })
    return context.prisma.deleteWorkspace({ id })
  },
  async updateWorkspace(root, { id, name }, context) {
    checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true, verifyUser: true
    })
    await checkPrivilege(context, { requiredPrivilege: 'EDIT', workspaceId: id })
    return context.prisma.updateWorkspace({
      where: { id },
      data: { name }
    })
  },
  async addDefaultCourseForWorkspace(root, { workspaceId, courseId }, context) {
    await checkPrivilege(context, { requiredPrivilege: 'EDIT', workspaceId })
    return await context.prisma.updateWorkspace({
      where: {
        id: workspaceId
      },
      data: {
        defaultCourse: {
          connect: { id: courseId }
        }
      }
    })
  }
}

module.exports = WorkspaceMutations
