const { checkAccess } = require('../../accessControl')

const ProjectMutations = {
  createProject(root, args, context) {
    checkAccess(context, { allowStaff: true })
    return context.prisma.createProject({
      name: args.name,
      owner: {
        connect: { id : context.user.id }
      }
    })
  },
  async deleteProject(root, args, context) {
    const user = await context.prisma.project({
      id: args.id
    }).owner()
    checkAccess(context, { allowStaff: true, verifyUser: true, userId: user.id})
    return context.prisma.deleteProject({
      id: args.id
    })
  },
  async updateProject(root, args, context) {
    const user = await context.prisma.project({
      id: args.id
    }).owner()
    checkAccess(context, { allowStaff: true, verifyUser: true, userId: user.id})
    return context.prisma.updateProject({
      where: { id: args.id },
      data: { name: args.name }
    })
  }
}

module.exports = ProjectMutations
