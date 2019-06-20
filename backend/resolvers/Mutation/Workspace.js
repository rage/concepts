const { checkAccess } = require('../../accessControl')

const WorkspaceMutations = {
  async createWorkspace(root, args, context) {
    checkAccess(context, { allowStudent: true, allowStaff: true })
    return await context.prisma.createWorkspace({
      name: args.name,
      owner: {
        connect: { id: context.user.id }
      },
      project: {
        connect: { id: args.projectId }
      }
    })
  },
  async deleteWorkspace(root, args, context) {
    const owner = await context.prisma.workspace({
      id: args.id
    }).owner()
    checkAccess(context, { allowStudent: true, verifyUser: true, userId: owner.id })
    return context.prisma.deleteWorkspace({ id: args.id })
  },
  async addDefaultCourseForWorkspace(root, args, context) {
    return await context.prisma.updateWorkspace({
      where: {
        id: args.workspaceId
      },
      data: {
        defaultCourse: {
          connect: { id: args.courseId }
        }
      }
    })
  },
  async createGuestWorkspace(root, args, context) {
    return await context.prisma.createWorkspace({
      name: args.name,
      public: true
    })
  }
}

module.exports = WorkspaceMutations