const { checkAccess } = require('../../accessControl')

const WorkspaceMutations = {
  async createWorkspace(root, args, context) {
    checkAccess(context, { allowStudent: true })
    return await context.prisma.createWorkspace({
      owner: {
        connect: { id: context.user.id }
      },
      defaultCourse: {
        connect: { id: args.defaultCourseId }
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
  }
}

module.exports = WorkspaceMutations