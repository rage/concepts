const { checkAccess } = require('../../accessControl')

const WorkspaceMutations = {
  async createWorkspace(root, args, context) {
    await checkAccess(context, { allowGuest: true, allowStudent: true, allowStaff: true })
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
    await checkAccess(context, {
      allowGuest: true, allowStudent: true, allowStaff: true,
      checkPrivilege: { requiredPrivilege: 'OWNER', workspaceId: id }
    })
    return context.prisma.deleteWorkspace({ id })
  },
  async updateWorkspace(root, { id, name }, context) {
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId: id }
    })
    return context.prisma.updateWorkspace({
      where: { id },
      data: { name }
    })
  },
  async addDefaultCourseForWorkspace(root, { workspaceId, courseId }, context) {
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId }
    })
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
