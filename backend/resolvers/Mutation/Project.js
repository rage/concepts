const { checkAccess } = require('../../accessControl')

const ProjectMutations = {
  async createProject(root, args, context) {
    await checkAccess(context, { allowStaff: true })
    return await context.prisma.createProject({
      name: args.name,
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
  async deleteProject(root, args, context) {
    await checkAccess(context, {
      allowStaff: true,
      checkPrivilege: { requiredPrivilege: 'OWNER', projectId: args.id }
    })
    return await context.prisma.deleteProject({
      id: args.id
    })
  },
  async updateProject(root, args, context) {
    await checkAccess(context, {
      allowStaff: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', projectId: args.id }
    })
    return await context.prisma.updateProject({
      where: { id: args.id },
      data: { name: args.name }
    })
  }
}

module.exports = ProjectMutations
